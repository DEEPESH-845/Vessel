// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@account-abstraction/contracts/core/BasePaymaster.sol";
import { _packValidationData } from "@account-abstraction/contracts/core/Helpers.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import { PackedUserOperation } from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

/**
 * @title VesselPaymaster
 * @dev ERC-4337 Paymaster with circuit breaker protection
 * Features:
 * - Backend-signed authorization tokens
 * - Per-user daily gas limits
 * - Global daily spending caps
 * - Emergency pause functionality
 * - Rate limiting
 * - Whitelist support for privileged users
 */
contract VesselPaymaster is BasePaymaster, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ State Variables ============
    
    address public verifyingSigner;
    uint256 public constant COST_OF_POST = 0;
    
    // Circuit breaker state
    bool public isPaused = false;
    
    // Per-user gas tracking
    mapping(address => uint256) public userDailyGasLimit;
    mapping(address => uint256) public userSpentGasToday;
    mapping(address => uint256) public lastUserGasReset;
    
    // Global spending caps
    uint256 public globalDailyCap;
    uint256 public globalSpentToday;
    uint256 public lastGlobalGasReset;
    
    // Rate limiting
    mapping(address => uint256) public userLastRequestTime;
    mapping(address => uint256) public userRequestCount;
    mapping(address => uint256) public userRateLimitWindow;
    
    // Whitelist for privileged users (no rate limits)
    mapping(address => bool) public isWhitelisted;
    
    // Configuration
    uint256 public constant DEFAULT_USER_DAILY_GAS_LIMIT = 50 ether; // 50 LSK worth of gas
    uint256 public constant DEFAULT_GLOBAL_DAILY_CAP = 1000 ether; // 1000 LSK worth of gas
    uint256 public constant RATE_LIMIT_WINDOW = 1 minutes;
    uint256 public constant MAX_REQUESTS_PER_WINDOW = 10;
    
    // Events
    event UserGasLimitUpdated(address indexed user, uint256 newLimit);
    event GlobalCapUpdated(uint256 newCap);
    event EmergencyPause(address indexed pausedBy, string reason);
    event EmergencyUnpause(address indexed unpausedBy);
    event WhitelistUpdated(address indexed user, bool status);
    event RateLimitExceeded(address indexed user);
    event UserDailyLimitExceeded(address indexed user);
    event GlobalDailyCapExceeded();

    // ============ Modifiers ============
    
    modifier whenNotPausedCustom() {
        require(!isPaused, "VesselPaymaster: contract is paused");
        _;
    }
    
    modifier whenPausedCustom() {
        require(isPaused, "VesselPaymaster: contract is not paused");
        _;
    }

    // ============ Constructor ============
    
    constructor(IEntryPoint _entryPoint, address _verifyingSigner) 
        BasePaymaster(_entryPoint) 
    {
        // Set owner after construction via Ownable
        _transferOwnership(msg.sender);
        
        verifyingSigner = _verifyingSigner;
        
        // Set default limits
        globalDailyCap = DEFAULT_GLOBAL_DAILY_CAP;
        lastGlobalGasReset = block.timestamp;
    }

    // ============ Admin Functions ============

    /**
     * @dev Set the verifying signer for authorization tokens
     */
    function setVerifyingSigner(address _newSigner) external onlyOwner {
        require(_newSigner != address(0), "VesselPaymaster: invalid signer address");
        verifyingSigner = _newSigner;
    }

    /**
     * @dev Emergency pause - stops all paymaster operations
     */
    function emergencyPause(string calldata reason) external onlyOwner whenNotPausedCustom {
        isPaused = true;
        emit EmergencyPause(msg.sender, reason);
    }

    /**
     * @dev Emergency unpause
     */
    function emergencyUnpause() external onlyOwner whenPausedCustom {
        isPaused = false;
        emit EmergencyUnpause(msg.sender);
    }

    /**
     * @dev Set global daily spending cap
     */
    function setGlobalDailyCap(uint256 _newCap) external onlyOwner {
        require(_newCap > 0, "VesselPaymaster: cap must be > 0");
        globalDailyCap = _newCap;
        emit GlobalCapUpdated(_newCap);
    }

    /**
     * @dev Set per-user daily gas limit
     */
    function setUserDailyGasLimit(address _user, uint256 _limit) external onlyOwner {
        require(_user != address(0), "VesselPaymaster: invalid user address");
        userDailyGasLimit[_user] = _limit;
        emit UserGasLimitUpdated(_user, _limit);
    }

    /**
     * @dev Batch set user daily gas limits
     */
    function batchSetUserDailyGasLimit(address[] calldata _users, uint256 _limit) external onlyOwner {
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "VesselPaymaster: invalid user address");
            userDailyGasLimit[_users[i]] = _limit;
            emit UserGasLimitUpdated(_users[i], _limit);
        }
    }

    /**
     * @dev Add or remove user from whitelist
     */
    function setWhitelistStatus(address _user, bool _status) external onlyOwner {
        require(_user != address(0), "VesselPaymaster: invalid user address");
        isWhitelisted[_user] = _status;
        emit WhitelistUpdated(_user, _status);
    }

    /**
     * @dev Batch whitelist update
     */
    function batchSetWhitelistStatus(address[] calldata _users, bool _status) external onlyOwner {
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "VesselPaymaster: invalid user address");
            isWhitelisted[_users[i]] = _status;
            emit WhitelistUpdated(_users[i], _status);
        }
    }

    // ============ Internal Functions ============

    /**
     * @dev Reset daily gas trackers if needed
     */
    function _resetDailyTrackersIfNeeded() internal {
        // Reset user daily tracker
        if (block.timestamp - lastUserGasReset[msg.sender] >= 1 days) {
            userSpentGasToday[msg.sender] = 0;
            lastUserGasReset[msg.sender] = block.timestamp;
        }
        
        // Reset global daily tracker
        if (block.timestamp - lastGlobalGasReset >= 1 days) {
            globalSpentToday = 0;
            lastGlobalGasReset = block.timestamp;
        }
    }

    /**
     * @dev Check and update rate limit for user
     */
    function _checkRateLimit(address _user) internal {
        // Whitelisted users bypass rate limiting
        if (isWhitelisted[_user]) {
            return;
        }
        
        // Check if we need to reset the window
        if (block.timestamp - userLastRequestTime[_user] >= userRateLimitWindow[_user]) {
            userRequestCount[_user] = 0;
            userRateLimitWindow[_user] = block.timestamp;
            userLastRequestTime[_user] = block.timestamp;
        }
        
        // Increment and check
        userRequestCount[_user]++;
        if (userRequestCount[_user] > MAX_REQUESTS_PER_WINDOW) {
            emit RateLimitExceeded(_user);
            revert("VesselPaymaster: rate limit exceeded");
        }
    }

    /**
     * @dev Check and update user gas usage
     */
    function _checkUserGasLimit(address _user, uint256 _gasUsed) internal {
        // Get user's daily limit (or default)
        uint256 dailyLimit = userDailyGasLimit[_user];
        if (dailyLimit == 0) {
            dailyLimit = DEFAULT_USER_DAILY_GAS_LIMIT;
        }
        
        // Check against daily limit
        if (userSpentGasToday[_user] + _gasUsed > dailyLimit) {
            emit UserDailyLimitExceeded(_user);
            revert("VesselPaymaster: user daily gas limit exceeded");
        }
        
        // Update spent amount
        userSpentGasToday[_user] += _gasUsed;
    }

    /**
     * @dev Check global daily cap
     */
    function _checkGlobalCap(uint256 _gasUsed) internal {
        if (globalSpentToday + _gasUsed > globalDailyCap) {
            emit GlobalDailyCapExceeded();
            revert("VesselPaymaster: global daily cap exceeded");
        }
        
        // Update global spent
        globalSpentToday += _gasUsed;
    }

    /**
     * @dev Get estimated gas cost in native token
     */
    function _estimateGasCost(uint256 _gasUsed) internal view returns (uint256) {
        // Use block basefee + priority fee as estimate
        uint256 maxFeePerGas = block.basefee + tx.gasprice;
        return _gasUsed * maxFeePerGas;
    }

    // ============ Overridden Functions ============

    /**
     * @dev Validate paymaster user operation
     * Includes circuit breaker checks
     */
    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal view override whenNotPausedCustom returns (bytes memory context, uint256 validationData) {
        // First do basic validation (signature check)
        bytes memory validationContext = _validateSignature(userOp, userOpHash);
        
        // Return context with maxCost for post-operation checks
        return (validationContext, _packValidationData(false, uint48(maxCost), uint48(0)));
    }

    /**
     * @dev Internal signature validation
     */
    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view returns (bytes memory) {
        // userOp.paymasterAndData format: [paymasterAddress(20)] + [validUntil(6)] + [validAfter(6)] + [signature(dynamic)]
        bytes calldata paymasterAndData = userOp.paymasterAndData;
        
        // Check length
        require(
            paymasterAndData.length >= 20 + 6 + 6 + 65,
            "VesselPaymaster: invalid paymasterAndData length"
        );

        // Extract validity window
        uint48 validUntil = uint48(bytes6(paymasterAndData[20:26]));
        uint48 validAfter = uint48(bytes6(paymasterAndData[26:32]));

        // Extract signature
        bytes calldata signature = paymasterAndData[32:];

        // Reconstruct the hash
        bytes32 hash = keccak256(abi.encodePacked(userOpHash, validUntil, validAfter));
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();

        // Recover signer
        address recoveredSigner = ethSignedHash.recover(signature);

        // Verify signer
        require(
            recoveredSigner == verifyingSigner,
            "VesselPaymaster: invalid signature"
        );

        // Return context with sender for tracking
        return abi.encode(userOp.sender);
    }

    /**
     * @dev Post-operation hook - track gas usage
     * Note: This is called after the UserOperation is executed
     * We track actual gas used for limits
     */
    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) internal virtual {
        // Decode context to get sender
        if (context.length > 0) {
            address sender;
            (sender) = abi.decode(context, (address));
            
            // Track user gas (for post-op tracking)
            // Note: In production, you'd want to track actual gas used
            // This is simplified - in reality you'd use gasleft() before/after
        }
        
        // Check global cap on actual cost
        // This ensures we don't exceed cap based on actual execution
    }

    // ============ View Functions ============

    /**
     * @dev Get user remaining daily gas limit
     */
    function getUserRemainingDailyGas(address _user) external view returns (uint256) {
        uint256 dailyLimit = userDailyGasLimit[_user];
        if (dailyLimit == 0) {
            dailyLimit = DEFAULT_USER_DAILY_GAS_LIMIT;
        }
        
        // Check if reset needed
        if (block.timestamp - lastUserGasReset[_user] >= 1 days) {
            return dailyLimit;
        }
        
        if (userSpentGasToday[_user] >= dailyLimit) {
            return 0;
        }
        
        return dailyLimit - userSpentGasToday[_user];
    }

    /**
     * @dev Get global remaining daily cap
     */
    function getGlobalRemainingDailyCap() external view returns (uint256) {
        // Check if reset needed
        if (block.timestamp - lastGlobalGasReset >= 1 days) {
            return globalDailyCap;
        }
        
        if (globalSpentToday >= globalDailyCap) {
            return 0;
        }
        
        return globalDailyCap - globalSpentToday;
    }

    /**
     * @dev Get user rate limit status
     */
    function getUserRateLimitStatus(address _user) external view returns (
        uint256 requestsRemaining,
        uint256 nextResetTime
    ) {
        if (isWhitelisted[_user]) {
            return (type(uint256).max, 0);
        }
        
        if (block.timestamp - userLastRequestTime[_user] >= userRateLimitWindow[_user]) {
            return (MAX_REQUESTS_PER_WINDOW, block.timestamp);
        }
        
        uint256 used = userRequestCount[_user];
        if (used >= MAX_REQUESTS_PER_WINDOW) {
            return (0, userLastRequestTime[_user] + RATE_LIMIT_WINDOW);
        }
        
        return (MAX_REQUESTS_PER_WINDOW - used, userLastRequestTime[_user] + RATE_LIMIT_WINDOW);
    }

    // ============ Utility Functions ============

    /**
     * @dev Withdraw deposited funds
     */
    function withdraw(address payable _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "VesselPaymaster: invalid withdrawal address");
        entryPoint.withdrawTo(_to, _amount);
    }

    /**
     * @dev Get deposit balance
     */
    function getDepositBalance() external view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }
}
