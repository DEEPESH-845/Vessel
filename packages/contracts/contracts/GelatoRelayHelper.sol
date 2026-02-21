// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GelatoRelayHelper
 * @dev Helper contract for Gelato Relay integration
 * Enables atomic transaction bundling: gas sponsorship + swap + transfer
 */
contract GelatoRelayHelper is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============
    
    // Gelato resolver address
    address public gelatoResolver;
    
    // Task ID tracking
    mapping(bytes32 => bool) public taskExists;
    mapping(bytes32 => TaskConfig) public taskConfigs;
    mapping(address => bytes32[]) public userTasks;
    
    // Fee collector
    address public feeCollector;
    uint256 public protocolFeeBps;
    
    // Task configuration
    struct TaskConfig {
        address creator;
        address target;
        address inputToken;
        address outputToken;
        address recipient;
        uint256 amount;
        uint256 maxFee;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bytes32 taskId;
    }
    
    // Events
    event TaskCreated(
        bytes32 indexed taskId,
        address indexed creator,
        address target,
        address inputToken,
        address outputToken,
        uint256 amount
    );
    event TaskCancelled(bytes32 indexed taskId);
    event TaskExecuted(
        bytes32 indexed taskId,
        address indexed executor,
        uint256 feePaid
    );
    event GelatoResolverUpdated(address indexed newResolver);
    event FeeCollectorUpdated(address indexed newFeeCollector);
    event FeeUpdated(uint256 newFeeBps);

    // ============ Constructor ============
    
    constructor(address _gelatoResolver, address _feeCollector, uint256 _protocolFeeBps) Ownable(msg.sender) {
        require(_gelatoResolver != address(0), "GelatoRelayHelper: invalid resolver");
        require(_feeCollector != address(0), "GelatoRelayHelper: invalid fee collector");
        
        gelatoResolver = _gelatoResolver;
        feeCollector = _feeCollector;
        protocolFeeBps = _protocolFeeBps;
    }

    // ============ Task Functions ============
    
    /**
     * @dev Create an automated task for Gelato Relay
     * @param _taskId Unique task ID
     * @param _target Target contract to call
     * @param _inputToken Token to swap from
     * @param _outputToken Token to swap to
     * @param _recipient Recipient of output tokens
     * @param _amount Amount to swap
     * @param _maxFee Maximum fee to pay Gelato
     * @param _startTime Task start timestamp
     * @param _endTime Task end timestamp
     */
    function createTask(
        bytes32 _taskId,
        address _target,
        address _inputToken,
        address _outputToken,
        address _recipient,
        uint256 _amount,
        uint256 _maxFee,
        uint256 _startTime,
        uint256 _endTime
    ) external nonReentrant returns (bytes32) {
        require(!taskExists[_taskId], "GelatoRelayHelper: task exists");
        require(_target != address(0), "GelatoRelayHelper: invalid target");
        require(_endTime > _startTime, "GelatoRelayHelper: invalid time range");
        
        // Approve tokens for execution
        IERC20(_inputToken).forceApprove(address(this), _amount);
        
        taskConfigs[_taskId] = TaskConfig({
            creator: msg.sender,
            target: _target,
            inputToken: _inputToken,
            outputToken: _outputToken,
            recipient: _recipient,
            amount: _amount,
            maxFee: _maxFee,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            taskId: _taskId
        });
        
        taskExists[_taskId] = true;
        userTasks[msg.sender].push(_taskId);
        
        emit TaskCreated(_taskId, msg.sender, _target, _inputToken, _outputToken, _amount);
        
        return _taskId;
    }
    
    /**
     * @dev Cancel a task
     */
    function cancelTask(bytes32 _taskId) external {
        TaskConfig storage config = taskConfigs[_taskId];
        require(config.creator == msg.sender || msg.sender == owner(), "GelatoRelayHelper: not authorized");
        require(config.isActive, "GelatoRelayHelper: not active");
        
        config.isActive = false;
        
        // Revoke token approval
        if (config.amount > 0) {
            IERC20(config.inputToken).forceApprove(address(this), 0);
        }
        
        emit TaskCancelled(_taskId);
    }
    
    /**
     * @dev Execute a task (called by Gelato Relay)
     */
    function executeTask(
        bytes32 _taskId,
        address _executor,
        uint256 _fee
    ) external nonReentrant returns (bool) {
        require(msg.sender == gelatoResolver, "GelatoRelayHelper: not gelato");
        
        TaskConfig storage config = taskConfigs[_taskId];
        require(config.isActive, "GelatoRelayHelper: not active");
        require(block.timestamp >= config.startTime, "GelatoRelayHelper: not started");
        require(block.timestamp <= config.endTime, "GelatoRelayHelper: ended");
        
        // Verify fee doesn't exceed max
        require(_fee <= config.maxFee, "GelatoRelayHelper: fee too high");
        
        // Transfer input tokens from creator
        IERC20(config.inputToken).safeTransferFrom(config.creator, address(this), config.amount);
        
        // Execute the target call (e.g., swap on AMM)
        (bool success, ) = config.target.call(
            abi.encodeWithSignature(
                "execute(bytes32,address,address,address,uint256)",
                _taskId,
                config.inputToken,
                config.outputToken,
                config.recipient,
                config.amount
            )
        );
        
        // Pay Gelato executor
        if (_fee > 0) {
            IERC20(config.inputToken).safeTransferFrom(config.creator, _executor, _fee);
            
            // Pay protocol fee
            uint256 protocolFee = (_fee * protocolFeeBps) / 10000;
            if (protocolFee > 0) {
                IERC20(config.inputToken).safeTransferFrom(config.creator, feeCollector, protocolFee);
            }
        }
        
        emit TaskExecuted(_taskId, _executor, _fee);
        
        return success;
    }

    // ============ GelatoResolver Interface ============
    
    /**
     * @dev Check if task can be executed (Gelato resolver)
     * This function is called by Gelato to determine if task should run
     */
    function checker(bytes32 _taskId) external view returns (bool canExec, bytes memory execPayload) {
        TaskConfig storage config = taskConfigs[_taskId];
        
        // Check if task is active and within time window
        if (!config.isActive) {
            return (false, "Task not active");
        }
        
        if (block.timestamp < config.startTime) {
            return (false, "Task not started");
        }
        
        if (block.timestamp > config.endTime) {
            return (false, "Task ended");
        }
        
        // Check if creator has sufficient balance
        uint256 balance = IERC20(config.inputToken).balanceOf(config.creator);
        if (balance < config.amount + config.maxFee) {
            return (false, "Insufficient balance");
        }
        
        // Return execution payload
        canExec = true;
        execPayload = abi.encodeWithSelector(
            this.executeTask.selector,
            _taskId,
            tx.origin, // executor address
            config.maxFee
        );
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Update Gelato resolver address
     */
    function setGelatoResolver(address _resolver) external onlyOwner {
        require(_resolver != address(0), "GelatoRelayHelper: invalid resolver");
        gelatoResolver = _resolver;
        emit GelatoResolverUpdated(_resolver);
    }
    
    /**
     * @dev Update fee collector
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "GelatoRelayHelper: invalid fee collector");
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(_feeCollector);
    }
    
    /**
     * @dev Update protocol fee
     */
    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "GelatoRelayHelper: fee too high");
        protocolFeeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }
    
    /**
     * @dev Withdraw accidentally sent tokens
     */
    function rescueTokens(address _token, address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "GelatoRelayHelper: invalid recipient");
        IERC20(_token).safeTransfer(_to, _amount);
    }

    // ============ View Functions ============
    
    /**
     * @dev Get task config
     */
    function getTaskConfig(bytes32 _taskId) external view returns (
        address creator,
        address target,
        address inputToken,
        address outputToken,
        address recipient,
        uint256 amount,
        uint256 maxFee,
        uint256 startTime,
        uint256 endTime,
        bool isActive
    ) {
        TaskConfig storage config = taskConfigs[_taskId];
        return (
            config.creator,
            config.target,
            config.inputToken,
            config.outputToken,
            config.recipient,
            config.amount,
            config.maxFee,
            config.startTime,
            config.endTime,
            config.isActive
        );
    }
    
    /**
     * @dev Get user tasks
     */
    function getUserTasks(address _user) external view returns (bytes32[] memory) {
        return userTasks[_user];
    }
    
    /**
     * @dev Get task count for user
     */
    function getUserTaskCount(address _user) external view returns (uint256) {
        return userTasks[_user].length;
    }
}
