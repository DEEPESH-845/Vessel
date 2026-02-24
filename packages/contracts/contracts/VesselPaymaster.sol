// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@account-abstraction/contracts/core/BasePaymaster.sol";
import { _packValidationData } from "@account-abstraction/contracts/core/Helpers.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import { PackedUserOperation } from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

/**
 * @title VesselPaymaster
 * @dev ERC-4337 Paymaster with circuit breaker protection
 * Features:
 * - Backend-signed authorization tokens with validity windows
 * - Per-user daily gas limits with automatic reset
 * - Global daily spending caps
 * - Emergency pause functionality
 * - Rate limiting per time window
 * - Whitelist support for privileged users
 * - Post-op gas refund tracking
 */
contract VesselPaymaster is BasePaymaster {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ State Variables ============

    address public verifyingSigner;
    uint256 public constant COST_OF_POST = 40000;

    // Circuit breaker state
    bool public isPaused;

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

    // Whitelist for privileged users (no rate limits)
    mapping(address => bool) public isWhitelisted;

    // Configuration
    uint256 public constant DEFAULT_USER_DAILY_GAS_LIMIT = 50 ether;
    uint256 public constant DEFAULT_GLOBAL_DAILY_CAP = 1000 ether;
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
    event GasRefunded(address indexed user, uint256 refundAmount);

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
        _transferOwnership(msg.sender);

        require(_verifyingSigner != address(0), "VesselPaymaster: invalid signer");
        verifyingSigner = _verifyingSigner;

        globalDailyCap = DEFAULT_GLOBAL_DAILY_CAP;
        lastGlobalGasReset = block.timestamp;
    }

    // ============ Admin Functions ============

    function setVerifyingSigner(address _newSigner) external onlyOwner {
        require(_newSigner != address(0), "VesselPaymaster: invalid signer address");
        verifyingSigner = _newSigner;
    }

    function emergencyPause(string calldata reason) external onlyOwner whenNotPausedCustom {
        isPaused = true;
        emit EmergencyPause(msg.sender, reason);
    }

    function emergencyUnpause() external onlyOwner whenPausedCustom {
        isPaused = false;
        emit EmergencyUnpause(msg.sender);
    }

    function setGlobalDailyCap(uint256 _newCap) external onlyOwner {
        require(_newCap > 0, "VesselPaymaster: cap must be > 0");
        globalDailyCap = _newCap;
        emit GlobalCapUpdated(_newCap);
    }

    function setUserDailyGasLimit(address _user, uint256 _limit) external onlyOwner {
        require(_user != address(0), "VesselPaymaster: invalid user address");
        userDailyGasLimit[_user] = _limit;
        emit UserGasLimitUpdated(_user, _limit);
    }

    function batchSetUserDailyGasLimit(address[] calldata _users, uint256 _limit) external onlyOwner {
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "VesselPaymaster: invalid user address");
            userDailyGasLimit[_users[i]] = _limit;
            emit UserGasLimitUpdated(_users[i], _limit);
        }
    }

    function setWhitelistStatus(address _user, bool _status) external onlyOwner {
        require(_user != address(0), "VesselPaymaster: invalid user address");
        isWhitelisted[_user] = _status;
        emit WhitelistUpdated(_user, _status);
    }

    function batchSetWhitelistStatus(address[] calldata _users, bool _status) external onlyOwner {
        for (uint256 i = 0; i < _users.length; i++) {
            require(_users[i] != address(0), "VesselPaymaster: invalid user address");
            isWhitelisted[_users[i]] = _status;
            emit WhitelistUpdated(_users[i], _status);
        }
    }

    // ============ Internal Functions ============

    /**
     * @dev Reset daily gas trackers if needed for a specific user
     */
    function _resetDailyTrackersIfNeeded(address _user) internal {
        if (block.timestamp - lastUserGasReset[_user] >= 1 days) {
            userSpentGasToday[_user] = 0;
            lastUserGasReset[_user] = block.timestamp;
        }

        if (block.timestamp - lastGlobalGasReset >= 1 days) {
            globalSpentToday = 0;
            lastGlobalGasReset = block.timestamp;
        }
    }

    /**
     * @dev Check and update rate limit for user using RATE_LIMIT_WINDOW constant
     */
    function _checkRateLimit(address _user) internal {
        if (isWhitelisted[_user]) {
            return;
        }

        if (block.timestamp - userLastRequestTime[_user] >= RATE_LIMIT_WINDOW) {
            userRequestCount[_user] = 0;
            userLastRequestTime[_user] = block.timestamp;
        }

        userRequestCount[_user]++;
        if (userRequestCount[_user] > MAX_REQUESTS_PER_WINDOW) {
            emit RateLimitExceeded(_user);
            revert("VesselPaymaster: rate limit exceeded");
        }
    }

    function _checkUserGasLimit(address _user, uint256 _gasUsed) internal {
        uint256 dailyLimit = userDailyGasLimit[_user];
        if (dailyLimit == 0) {
            dailyLimit = DEFAULT_USER_DAILY_GAS_LIMIT;
        }

        if (userSpentGasToday[_user] + _gasUsed > dailyLimit) {
            emit UserDailyLimitExceeded(_user);
            revert("VesselPaymaster: user daily gas limit exceeded");
        }

        userSpentGasToday[_user] += _gasUsed;
    }

    function _checkGlobalCap(uint256 _gasUsed) internal {
        if (globalSpentToday + _gasUsed > globalDailyCap) {
            emit GlobalDailyCapExceeded();
            revert("VesselPaymaster: global daily cap exceeded");
        }

        globalSpentToday += _gasUsed;
    }

    // ============ Overridden Functions ============

    /**
     * @dev Validate paymaster user operation with circuit breaker checks.
     * Returns context encoding (sender, maxCost, validUntil, validAfter) for _postOp.
     */
    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal override whenNotPausedCustom returns (bytes memory context, uint256 validationData) {
        (, uint48 validUntil, uint48 validAfter) = _validateSignature(userOp, userOpHash);

        address sender = userOp.sender;

        _resetDailyTrackersIfNeeded(sender);
        _checkRateLimit(sender);
        _checkUserGasLimit(sender, maxCost);
        _checkGlobalCap(maxCost);

        // Encode sender + maxCost into context for _postOp gas refund
        context = abi.encode(sender, maxCost);
        validationData = _packValidationData(false, validUntil, validAfter);
    }

    /**
     * @dev Internal signature validation.
     * Returns context, validUntil, and validAfter extracted from paymasterAndData.
     */
    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view returns (bytes memory, uint48, uint48) {
        bytes calldata paymasterAndData = userOp.paymasterAndData;

        require(
            paymasterAndData.length >= 20 + 6 + 6 + 65,
            "VesselPaymaster: invalid paymasterAndData length"
        );

        uint48 validUntil = uint48(bytes6(paymasterAndData[20:26]));
        uint48 validAfter = uint48(bytes6(paymasterAndData[26:32]));
        bytes calldata signature = paymasterAndData[32:];

        bytes32 hash = keccak256(abi.encodePacked(userOpHash, validUntil, validAfter));
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedHash.recover(signature);

        require(
            recoveredSigner == verifyingSigner,
            "VesselPaymaster: invalid signature"
        );

        return (abi.encode(userOp.sender), validUntil, validAfter);
    }

    /**
     * @dev Post-operation hook — refunds the difference between estimated and actual gas.
     * Matches BasePaymaster's 4-param signature so it actually gets called.
     */
    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost,
        uint256 actualUserOpFeePerGas
    ) internal override {
        (mode, actualUserOpFeePerGas); // suppress unused warnings

        if (context.length == 0) return;

        (address sender, uint256 estimatedCost) = abi.decode(context, (address, uint256));

        // Refund the difference between estimated and actual gas usage
        if (estimatedCost > actualGasCost) {
            uint256 refund = estimatedCost - actualGasCost;

            if (userSpentGasToday[sender] >= refund) {
                userSpentGasToday[sender] -= refund;
            } else {
                userSpentGasToday[sender] = 0;
            }

            if (globalSpentToday >= refund) {
                globalSpentToday -= refund;
            } else {
                globalSpentToday = 0;
            }

            emit GasRefunded(sender, refund);
        }
    }

    // ============ View Functions ============

    function getUserRemainingDailyGas(address _user) external view returns (uint256) {
        uint256 dailyLimit = userDailyGasLimit[_user];
        if (dailyLimit == 0) {
            dailyLimit = DEFAULT_USER_DAILY_GAS_LIMIT;
        }

        if (block.timestamp - lastUserGasReset[_user] >= 1 days) {
            return dailyLimit;
        }

        if (userSpentGasToday[_user] >= dailyLimit) {
            return 0;
        }

        return dailyLimit - userSpentGasToday[_user];
    }

    function getGlobalRemainingDailyCap() external view returns (uint256) {
        if (block.timestamp - lastGlobalGasReset >= 1 days) {
            return globalDailyCap;
        }

        if (globalSpentToday >= globalDailyCap) {
            return 0;
        }

        return globalDailyCap - globalSpentToday;
    }

    function getUserRateLimitStatus(address _user) external view returns (
        uint256 requestsRemaining,
        uint256 nextResetTime
    ) {
        if (isWhitelisted[_user]) {
            return (type(uint256).max, 0);
        }

        if (block.timestamp - userLastRequestTime[_user] >= RATE_LIMIT_WINDOW) {
            return (MAX_REQUESTS_PER_WINDOW, block.timestamp);
        }

        uint256 used = userRequestCount[_user];
        if (used >= MAX_REQUESTS_PER_WINDOW) {
            return (0, userLastRequestTime[_user] + RATE_LIMIT_WINDOW);
        }

        return (MAX_REQUESTS_PER_WINDOW - used, userLastRequestTime[_user] + RATE_LIMIT_WINDOW);
    }

    // ============ Utility Functions ============

    function withdraw(address payable _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "VesselPaymaster: invalid withdrawal address");
        entryPoint.withdrawTo(_to, _amount);
    }

    function getDepositBalance() external view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }
}
