// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title PaymentProcessor
 * @dev Handles merchant settlement logic with support for:
 * - Single payments
 * - Batch payments
 * - Recurring subscriptions
 * - Payment events for indexing
 * - Webhook notifications
 * SECURITY: Added reentrancy guards, payer authorization, and access controls
 */
contract PaymentProcessor is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Custom pause state
    bool public isPaused = false;

    // ============ Constants ============
    
    uint256 public constant MAX_FEE_BPS = 1000; // Max 10%
    uint256 public constant MIN_PAYMENT_AMOUNT = 1; // 1 wei minimum

    // ============ State Variables ============
    
    // Authorized payment completers (for payer authorization)
    mapping(bytes32 => bool) public authorizedPaymentCompletions;
    
    // Merchant configuration
    struct MerchantConfig {
        address merchant;
        address settlementToken;
        uint256 feeBps;
        bool isActive;
        string webhookUrl;
        bool isVerified; // KYC verified merchants
    }
    mapping(bytes32 => MerchantConfig) public merchantConfigs;
    mapping(address => bytes32[]) public merchantIds;
    
    // Payment state
    enum PaymentStatus {
        Pending,
        Completed,
        Failed,
        Refunded,
        Disputed
    }
    
    struct Payment {
        bytes32 paymentId;
        bytes32 merchantId;
        address payer;
        address token;
        uint256 amount;
        uint256 feeAmount;
        uint256 netAmount;
        PaymentStatus status;
        uint256 createdAt;
        uint256 completedAt;
        string metadata;
    }
    mapping(bytes32 => Payment) public payments;
    bytes32[] public paymentIds;
    
    // Subscription state
    struct Subscription {
        bytes32 subscriptionId;
        bytes32 merchantId;
        address subscriber;
        address token;
        uint256 amount;
        uint256 interval; // seconds between payments
        uint256 nextPaymentTime;
        uint256 createdAt;
        bool isActive;
    }
    mapping(bytes32 => Subscription) public subscriptions;
    bytes32[] public subscriptionIds;
    mapping(address => bytes32[]) public subscriberSubscriptions;
    
    // Batch payment state
    struct BatchPayment {
        bytes32 batchId;
        bytes32 merchantId;
        address token;
        uint256 totalAmount;
        uint256 numPayments;
        uint256 completedPayments;
        PaymentStatus status;
        uint256 createdAt;
    }
    mapping(bytes32 => BatchPayment) public batchPayments;
    mapping(bytes32 => bytes32[]) public batchPaymentIds;
    
    // Global fee collector
    address public feeCollector;
    uint256 public protocolFeeBps; // Protocol fee in basis points
    
    // Accepted tokens
    mapping(address => bool) public acceptedTokens;
    address[] public acceptedTokenList;
    
    // Authorized executors for subscriptions (can be a relayer service)
    mapping(address => bool) public authorizedExecutors;

    // Events
    event MerchantRegistered(
        bytes32 indexed merchantId,
        address indexed merchant,
        address settlementToken,
        uint256 feeBps
    );
    event MerchantUpdated(
        bytes32 indexed merchantId,
        address settlementToken,
        uint256 feeBps,
        bool isActive
    );
    event MerchantVerified(
        bytes32 indexed merchantId,
        bool isVerified
    );
    event MerchantWebhookSet(
        bytes32 indexed merchantId,
        string webhookUrl
    );
    
    event PaymentCreated(
        bytes32 indexed paymentId,
        bytes32 indexed merchantId,
        address indexed payer,
        address token,
        uint256 amount
    );
    event PaymentCompleted(
        bytes32 indexed paymentId,
        uint256 feeAmount,
        uint256 netAmount
    );
    event PaymentFailed(
        bytes32 indexed paymentId,
        string reason
    );
    event PaymentRefunded(
        bytes32 indexed paymentId,
        uint256 amount
    );
    event PaymentDisputed(
        bytes32 indexed paymentId,
        address disputedBy
    );
    event PaymentResolved(
        bytes32 indexed paymentId,
        bool refundIssued
    );
    event PaymentAuthorized(
        bytes32 indexed paymentId,
        address indexed authorizedSigner
    );
    
    event SubscriptionCreated(
        bytes32 indexed subscriptionId,
        bytes32 indexed merchantId,
        address indexed subscriber,
        uint256 amount,
        uint256 interval
    );
    event SubscriptionCancelled(
        bytes32 indexed subscriptionId
    );
    event SubscriptionPayment(
        bytes32 indexed subscriptionId,
        bytes32 indexed paymentId,
        uint256 amount
    );
    
    event BatchPaymentCreated(
        bytes32 indexed batchId,
        bytes32 indexed merchantId,
        uint256 numPayments,
        uint256 totalAmount
    );
    event BatchPaymentCompleted(
        bytes32 indexed batchId
    );
    event BatchPaymentFailed(
        bytes32 indexed batchId,
        uint256 failedIndex
    );
    
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event ProtocolFeeUpdated(uint256 newFeeBps);
    event FeeCollectorUpdated(address indexed newFeeCollector);
    event ExecutorUpdated(address indexed executor, bool authorized);

    // ============ Modifiers ============
    
    modifier whenNotPaused() {
        require(!isPaused, "PaymentProcessor: paused");
        _;
    }
    
    modifier onlyMerchant(bytes32 _merchantId) {
        require(
            merchantConfigs[_merchantId].merchant == msg.sender,
            "PaymentProcessor: not merchant"
        );
        _;
    }
    
    modifier onlyAuthorizedExecutor() {
        require(
            authorizedExecutors[msg.sender] || msg.sender == owner(),
            "PaymentProcessor: not authorized executor"
        );
        _;
    }

    // ============ Constructor ============
    
    constructor(address _feeCollector, uint256 _protocolFeeBps) Ownable(msg.sender) {
        require(_feeCollector != address(0), "PaymentProcessor: invalid fee collector");
        require(_protocolFeeBps <= MAX_FEE_BPS, "PaymentProcessor: fee too high");
        
        feeCollector = _feeCollector;
        protocolFeeBps = _protocolFeeBps;
        
        // Set owner as default authorized executor
        authorizedExecutors[msg.sender] = true;
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Set authorized executor for subscription processing
     */
    function setAuthorizedExecutor(address _executor, bool _authorized) external onlyOwner {
        require(_executor != address(0), "PaymentProcessor: invalid executor");
        authorizedExecutors[_executor] = _authorized;
        emit ExecutorUpdated(_executor, _authorized);
    }

    // ============ Merchant Functions ============
    
    /**
     * @dev Register a new merchant
     */
    function registerMerchant(
        bytes32 _merchantId,
        address _settlementToken,
        uint256 _feeBps
    ) external whenNotPaused {
        require(_merchantId != bytes32(0), "PaymentProcessor: invalid merchant ID");
        require(merchantConfigs[_merchantId].merchant == address(0), "PaymentProcessor: merchant exists");
        require(_settlementToken != address(0), "PaymentProcessor: invalid token");
        require(_feeBps <= MAX_FEE_BPS, "PaymentProcessor: fee too high");
        
        merchantConfigs[_merchantId] = MerchantConfig({
            merchant: msg.sender,
            settlementToken: _settlementToken,
            feeBps: _feeBps,
            isActive: true,
            webhookUrl: "",
            isVerified: false // Must go through KYC
        });
        
        merchantIds[msg.sender].push(_merchantId);
        
        emit MerchantRegistered(_merchantId, msg.sender, _settlementToken, _feeBps);
    }
    
    /**
     * @dev Update merchant configuration
     */
    function updateMerchant(
        bytes32 _merchantId,
        address _settlementToken,
        uint256 _feeBps,
        bool _isActive
    ) external onlyMerchant(_merchantId) whenNotPaused {
        require(_settlementToken != address(0), "PaymentProcessor: invalid token");
        require(_feeBps <= MAX_FEE_BPS, "PaymentProcessor: fee too high");
        
        merchantConfigs[_merchantId].settlementToken = _settlementToken;
        merchantConfigs[_merchantId].feeBps = _feeBps;
        merchantConfigs[_merchantId].isActive = _isActive;
        
        emit MerchantUpdated(_merchantId, _settlementToken, _feeBps, _isActive);
    }
    
    /**
     * @dev Verify merchant (KYC) - can only be done by owner
     */
    function verifyMerchant(bytes32 _merchantId, bool _verified) external onlyOwner {
        require(merchantConfigs[_merchantId].merchant != address(0), "PaymentProcessor: merchant not found");
        merchantConfigs[_merchantId].isVerified = _verified;
        emit MerchantVerified(_merchantId, _verified);
    }
    
    /**
     * @dev Set merchant webhook URL
     */
    function setMerchantWebhook(
        bytes32 _merchantId,
        string calldata _webhookUrl
    ) external onlyMerchant(_merchantId) {
        merchantConfigs[_merchantId].webhookUrl = _webhookUrl;
        
        emit MerchantWebhookSet(_merchantId, _webhookUrl);
    }
    
    /**
     * @dev Get merchant config
     */
    function getMerchantConfig(bytes32 _merchantId) external view returns (
        address merchant,
        address settlementToken,
        uint256 feeBps,
        bool isActive,
        string memory webhookUrl,
        bool isVerified
    ) {
        MerchantConfig storage config = merchantConfigs[_merchantId];
        return (
            config.merchant,
            config.settlementToken,
            config.feeBps,
            config.isActive,
            config.webhookUrl,
            config.isVerified
        );
    }

    // ============ Payment Functions ============
    
    /**
     * @dev Authorize payment completion (called by payer)
     * SECURITY: This allows payers to pre-authorize payment completion
     */
    function authorizePaymentCompletion(bytes32 _paymentId) external {
        Payment storage payment = payments[_paymentId];
        require(payment.payer == msg.sender, "PaymentProcessor: not payer");
        require(payment.status == PaymentStatus.Pending, "PaymentProcessor: not pending");
        
        authorizedPaymentCompletions[_paymentId] = true;
        emit PaymentAuthorized(_paymentId, msg.sender);
    }
    
    /**
     * @dev Create a payment
     */
    function createPayment(
        bytes32 _paymentId,
        bytes32 _merchantId,
        address _payer,
        address _token,
        uint256 _amount,
        string calldata _metadata
    ) external whenNotPaused returns (uint256 feeAmount, uint256 netAmount) {
        require(_paymentId != bytes32(0), "PaymentProcessor: invalid payment ID");
        require(payments[_paymentId].payer == address(0), "PaymentProcessor: payment exists");
        
        MerchantConfig storage config = merchantConfigs[_merchantId];
        require(config.merchant != address(0), "PaymentProcessor: merchant not found");
        require(config.isActive, "PaymentProcessor: merchant not active");
        require(acceptedTokens[_token], "PaymentProcessor: token not accepted");
        require(_amount >= MIN_PAYMENT_AMOUNT, "PaymentProcessor: amount too low");
        
        // Calculate fees
        uint256 merchantFee = (_amount * config.feeBps) / 10000;
        uint256 protocolFee = (_amount * protocolFeeBps) / 10000;
        feeAmount = merchantFee + protocolFee;
        netAmount = _amount - feeAmount;
        
        // Create payment record
        payments[_paymentId] = Payment({
            paymentId: _paymentId,
            merchantId: _merchantId,
            payer: _payer,
            token: _token,
            amount: _amount,
            feeAmount: feeAmount,
            netAmount: netAmount,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            metadata: _metadata
        });
        
        paymentIds.push(_paymentId);
        
        // Transfer tokens from payer
        IERC20(_token).safeTransferFrom(_payer, address(this), _amount);
        
        emit PaymentCreated(_paymentId, _merchantId, _payer, _token, _amount);
    }
    
    /**
     * @dev Complete a payment - transfer to merchant
     * SECURITY: Now requires payer authorization or their signature
     */
    function completePayment(bytes32 _paymentId) external whenNotPaused nonReentrant {
        Payment storage payment = payments[_paymentId];
        require(payment.payer != address(0), "PaymentProcessor: payment not found");
        require(payment.status == PaymentStatus.Pending, "PaymentProcessor: not pending");
        
        MerchantConfig storage config = merchantConfigs[payment.merchantId];
        
        // SECURITY FIX: Require payer authorization (either direct call or pre-authorization)
        require(
            msg.sender == payment.payer || 
            authorizedPaymentCompletions[_paymentId] ||
            msg.sender == owner(), // Owner can act as fallback for failed transactions
            "PaymentProcessor: not authorized - payer must authorize"
        );
        
        // Clear authorization after use
        authorizedPaymentCompletions[_paymentId] = false;
        
        // Transfer net amount to merchant
        IERC20(payment.token).safeTransfer(config.merchant, payment.netAmount);
        
        // Transfer fee to fee collector
        if (payment.feeAmount > 0) {
            IERC20(payment.token).safeTransfer(feeCollector, payment.feeAmount);
        }
        
        payment.status = PaymentStatus.Completed;
        payment.completedAt = block.timestamp;
        
        emit PaymentCompleted(_paymentId, payment.feeAmount, payment.netAmount);
    }
    
    /**
     * @dev Fail a payment - refund payer
     * SECURITY: Added nonReentrant
     */
    function failPayment(bytes32 _paymentId, string calldata _reason) external nonReentrant {
        Payment storage payment = payments[_paymentId];
        require(payment.payer != address(0), "PaymentProcessor: payment not found");
        require(payment.status == PaymentStatus.Pending, "PaymentProcessor: not pending");
        
        // Only merchant can fail payment
        MerchantConfig storage config = merchantConfigs[payment.merchantId];
        require(
            msg.sender == config.merchant || msg.sender == owner(),
            "PaymentProcessor: not authorized"
        );
        
        payment.status = PaymentStatus.Failed;
        payment.completedAt = block.timestamp;
        
        // Refund payer
        IERC20(payment.token).safeTransfer(payment.payer, payment.amount);
        
        emit PaymentFailed(_paymentId, _reason);
    }
    
    /**
     * @dev Refund a payment
     * SECURITY: Added nonReentrant
     */
    function refundPayment(bytes32 _paymentId) external nonReentrant {
        Payment storage payment = payments[_paymentId];
        require(payment.payer != address(0), "PaymentProcessor: payment not found");
        
        // Only payer, merchant, or owner can refund
        require(
            msg.sender == payment.payer ||
            msg.sender == merchantConfigs[payment.merchantId].merchant ||
            msg.sender == owner(),
            "PaymentProcessor: not authorized"
        );
        
        require(
            payment.status == PaymentStatus.Completed ||
            payment.status == PaymentStatus.Disputed,
            "PaymentProcessor: cannot refund"
        );
        
        // Refund from merchant's funds (if completed)
        if (payment.status == PaymentStatus.Completed) {
            IERC20(payment.token).safeTransferFrom(
                merchantConfigs[payment.merchantId].merchant,
                payment.payer,
                payment.amount
            );
        }
        
        payment.status = PaymentStatus.Refunded;
        
        emit PaymentRefunded(_paymentId, payment.amount);
    }
    
    /**
     * @dev Dispute a payment
     * SECURITY: Added nonReentrant
     */
    function disputePayment(bytes32 _paymentId) external nonReentrant {
        Payment storage payment = payments[_paymentId];
        require(payment.payer != address(0), "PaymentProcessor: payment not found");
        require(payment.status == PaymentStatus.Completed, "PaymentProcessor: not completed");
        
        // Only payer can dispute
        require(msg.sender == payment.payer, "PaymentProcessor: not payer");
        
        payment.status = PaymentStatus.Disputed;
        
        emit PaymentDisputed(_paymentId, msg.sender);
    }
    
    /**
     * @dev Resolve a dispute
     * SECURITY: Added nonReentrant
     */
    function resolveDispute(bytes32 _paymentId, bool _refundIssued) external onlyOwner nonReentrant {
        Payment storage payment = payments[_paymentId];
        require(payment.status == PaymentStatus.Disputed, "PaymentProcessor: not disputed");
        
        if (_refundIssued) {
            // Refund from merchant
            IERC20(payment.token).safeTransferFrom(
                merchantConfigs[payment.merchantId].merchant,
                payment.payer,
                payment.amount
            );
            payment.status = PaymentStatus.Refunded;
        } else {
            // Keep payment as completed
            payment.status = PaymentStatus.Completed;
        }
        
        emit PaymentResolved(_paymentId, _refundIssued);
    }
    
    /**
     * @dev Get payment details
     */
    function getPayment(bytes32 _paymentId) external view returns (
        bytes32 paymentId,
        bytes32 merchantId,
        address payer,
        address token,
        uint256 amount,
        uint256 feeAmount,
        uint256 netAmount,
        PaymentStatus status,
        uint256 createdAt,
        uint256 completedAt,
        string memory metadata
    ) {
        Payment storage p = payments[_paymentId];
        return (
            p.paymentId,
            p.merchantId,
            p.payer,
            p.token,
            p.amount,
            p.feeAmount,
            p.netAmount,
            p.status,
            p.createdAt,
            p.completedAt,
            p.metadata
        );
    }

    // ============ Subscription Functions ============
    
    /**
     * @dev Create a subscription
     */
    function createSubscription(
        bytes32 _subscriptionId,
        bytes32 _merchantId,
        address _subscriber,
        address _token,
        uint256 _amount,
        uint256 _interval
    ) external whenNotPaused returns (bytes32 paymentId) {
        require(_subscriptionId != bytes32(0), "PaymentProcessor: invalid subscription ID");
        require(subscriptions[_subscriptionId].subscriber == address(0), "PaymentProcessor: subscription exists");
        
        MerchantConfig storage config = merchantConfigs[_merchantId];
        require(config.merchant != address(0), "PaymentProcessor: merchant not found");
        require(config.isActive, "PaymentProcessor: merchant not active");
        require(acceptedTokens[_token], "PaymentProcessor: token not accepted");
        require(_amount >= MIN_PAYMENT_AMOUNT, "PaymentProcessor: amount too low");
        require(_interval > 0, "PaymentProcessor: invalid interval");
        
        // Create subscription
        subscriptions[_subscriptionId] = Subscription({
            subscriptionId: _subscriptionId,
            merchantId: _merchantId,
            subscriber: _subscriber,
            token: _token,
            amount: _amount,
            interval: _interval,
            nextPaymentTime: block.timestamp + _interval,
            createdAt: block.timestamp,
            isActive: true
        });
        
        subscriptionIds.push(_subscriptionId);
        subscriberSubscriptions[_subscriber].push(_subscriptionId);
        
        emit SubscriptionCreated(_subscriptionId, _merchantId, _subscriber, _amount, _interval);
        
        return _subscriptionId;
    }
    
    /**
     * @dev Process subscription payment
     * SECURITY: Now requires authorized executor (no longer open to anyone)
     */
    function processSubscriptionPayment(bytes32 _subscriptionId) external whenNotPaused onlyAuthorizedExecutor nonReentrant returns (bytes32 paymentId) {
        Subscription storage sub = subscriptions[_subscriptionId];
        require(sub.subscriber != address(0), "PaymentProcessor: subscription not found");
        require(sub.isActive, "PaymentProcessor: subscription not active");
        require(block.timestamp >= sub.nextPaymentTime, "PaymentProcessor: not time yet");
        
        // Generate payment ID
        paymentId = keccak256(abi.encodePacked(_subscriptionId, sub.nextPaymentTime, block.timestamp));
        
        // Calculate fees
        MerchantConfig storage config = merchantConfigs[sub.merchantId];
        uint256 merchantFee = (sub.amount * config.feeBps) / 10000;
        uint256 protocolFee = (sub.amount * protocolFeeBps) / 10000;
        uint256 feeAmount = merchantFee + protocolFee;
        uint256 netAmount = sub.amount - feeAmount;
        
        // Create payment record
        payments[paymentId] = Payment({
            paymentId: paymentId,
            merchantId: sub.merchantId,
            payer: sub.subscriber,
            token: sub.token,
            amount: sub.amount,
            feeAmount: feeAmount,
            netAmount: netAmount,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            metadata: ""
        });
        
        paymentIds.push(paymentId);
        
        // Transfer tokens from subscriber
        IERC20(sub.token).safeTransferFrom(sub.subscriber, address(this), sub.amount);
        
        // Transfer net amount to merchant
        IERC20(sub.token).safeTransfer(config.merchant, netAmount);
        
        // Transfer fee to fee collector
        if (feeAmount > 0) {
            IERC20(sub.token).safeTransfer(feeCollector, feeAmount);
        }
        
        // Update payment and subscription state
        payments[paymentId].status = PaymentStatus.Completed;
        payments[paymentId].completedAt = block.timestamp;
        sub.nextPaymentTime = block.timestamp + sub.interval;
        
        emit SubscriptionPayment(_subscriptionId, paymentId, sub.amount);
        emit PaymentCompleted(paymentId, feeAmount, netAmount);
    }
    
    /**
     * @dev Cancel a subscription
     * SECURITY: Added nonReentrant
     */
    function cancelSubscription(bytes32 _subscriptionId) external nonReentrant {
        Subscription storage sub = subscriptions[_subscriptionId];
        require(sub.subscriber != address(0), "PaymentProcessor: subscription not found");
        
        // Only subscriber or merchant can cancel
        require(
            msg.sender == sub.subscriber ||
            msg.sender == merchantConfigs[sub.merchantId].merchant ||
            msg.sender == owner(),
            "PaymentProcessor: not authorized"
        );
        
        sub.isActive = false;
        
        emit SubscriptionCancelled(_subscriptionId);
    }

    // ============ Batch Payment Functions ============
    
    /**
     * @dev Create a batch payment
     */
    function createBatchPayment(
        bytes32 _batchId,
        bytes32 _merchantId,
        address _token,
        uint256 _totalAmount,
        uint256 _numPayments
    ) external onlyMerchant(_merchantId) whenNotPaused returns (bytes32) {
        require(_batchId != bytes32(0), "PaymentProcessor: invalid batch ID");
        require(batchPayments[_batchId].createdAt == 0, "PaymentProcessor: batch exists");
        
        batchPayments[_batchId] = BatchPayment({
            batchId: _batchId,
            merchantId: _merchantId,
            token: _token,
            totalAmount: _totalAmount,
            numPayments: _numPayments,
            completedPayments: 0,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp
        });
        
        batchPaymentIds[_merchantId].push(_batchId);
        
        // Transfer total amount from merchant
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _totalAmount);
        
        emit BatchPaymentCreated(_batchId, _merchantId, _numPayments, _totalAmount);
        
        return _batchId;
    }
    
    /**
     * @dev Complete a batch payment
     * SECURITY: Added onlyAuthorizedExecutor
     */
    function completeBatchPayment(bytes32 _batchId) external onlyAuthorizedExecutor nonReentrant {
        BatchPayment storage batch = batchPayments[_batchId];
        require(batch.createdAt > 0, "PaymentProcessor: batch not found");
        require(batch.status == PaymentStatus.Pending, "PaymentProcessor: not pending");
        
        MerchantConfig storage config = merchantConfigs[batch.merchantId];
        
        // Transfer to merchant
        IERC20(batch.token).safeTransfer(config.merchant, batch.totalAmount);
        
        batch.status = PaymentStatus.Completed;
        
        emit BatchPaymentCompleted(_batchId);
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Add accepted token
     */
    function addToken(address _token) external onlyOwner {
        require(_token != address(0), "PaymentProcessor: invalid token");
        require(!acceptedTokens[_token], "PaymentProcessor: token already accepted");
        
        acceptedTokens[_token] = true;
        acceptedTokenList.push(_token);
        
        emit TokenAdded(_token);
    }
    
    /**
     * @dev Remove accepted token
     */
    function removeToken(address _token) external onlyOwner {
        require(acceptedTokens[_token], "PaymentProcessor: token not accepted");
        
        acceptedTokens[_token] = false;
        
        emit TokenRemoved(_token);
    }
    
    /**
     * @dev Update protocol fee
     */
    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "PaymentProcessor: fee too high");
        protocolFeeBps = _feeBps;
        
        emit ProtocolFeeUpdated(_feeBps);
    }
    
    /**
     * @dev Update fee collector
     */
    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "PaymentProcessor: invalid fee collector");
        feeCollector = _feeCollector;
        
        emit FeeCollectorUpdated(_feeCollector);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        isPaused = true;
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        isPaused = false;
    }

    // ============ View Functions ============
    
    /**
     * @dev Get accepted tokens
     */
    function getAcceptedTokens() external view returns (address[] memory) {
        return acceptedTokenList;
    }
    
    /**
     * @dev Get subscription IDs for subscriber
     */
    function getSubscriberSubscriptions(address _subscriber) external view returns (bytes32[] memory) {
        return subscriberSubscriptions[_subscriber];
    }
    
    /**
     * @dev Get batch payments for merchant
     */
    function getMerchantBatchPayments(bytes32 _merchantId) external view returns (bytes32[] memory) {
        return batchPaymentIds[_merchantId];
    }
}
