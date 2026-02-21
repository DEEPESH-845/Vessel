// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ILPToken
 * @dev Liquidity Provider Token Interface - compatible with ERC20
 */
interface ILPToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

/**
 * @title StableSwapAMM
 * @dev Optimized AMM for stablecoin swaps with low slippage
 * Based on Curve Finance's StableSwap algorithm with amplification factor
 */
contract StableSwapAMM is Ownable {
    
    // Custom pause state
    bool public isPaused = false;
    
    modifier whenNotPaused() {
        require(!isPaused, "StableSwapAMM: paused");
        _;
    }
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    uint256 public constant N_COINS = 4;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_FEE = 1e10; // 10%
    uint256 public constant ADMIN_FEE = 1e9; // 10% of swap fee

    // ============ State Variables ============
    
    // Token addresses
    address[N_COINS] public coins;
    
    // Pool token
    ILPToken public lpToken;
    string public lpTokenName;
    string public lpTokenSymbol;
    
    // Amplification coefficient (A)
    // Higher A = more like constant product
    // Lower A = more like constant sum (lower slippage for balanced pools)
    uint256 public A;
    uint256 public constant A_PRECISION = 100;
    
    // Fee parameters
    uint256 public fee; // Swap fee (denominator 1e10)
    uint256 public adminFee; // Admin fee share (denominator 1e10)
    
    // Balances
    uint256[N_COINS] public balances;
    
    // Cumulative rates (for tracking exchange rates over time)
    uint256[N_COINS] public rates;
    uint256[N_COINS] public rateMultipliers;
    
    // Liquidity tracking
    uint256 public totalSupply;
    mapping(address => uint256) public depositTimestamp;
    
    // Events
    event TokenExchange(
        address indexed buyer,
        uint256 soldId,
        uint256 tokensSold,
        uint256 boughtId,
        uint256 tokensBought
    );
    event AddLiquidity(
        address indexed provider,
        uint256[N_COINS] tokenAmounts,
        uint256 liquidity
    );
    event RemoveLiquidity(
        address indexed provider,
        uint256[N_COINS] tokenAmounts,
        uint256 liquidity
    );
    event RemoveLiquidityOne(
        address indexed provider,
        uint256 tokenAmount,
        uint256 coinAmount
    );
    event RampA(uint256 oldA, uint256 newA, uint256 initialTime, uint256 futureTime);
    event StopRampA(uint256 currentA);
    event FeeUpdated(uint256 newFee);
    event AdminFeeUpdated(uint256 newAdminFee);

    // ============ Constructor ============
    
    /**
     * @dev Initialize the pool
     * @param _coins Array of coin addresses
     * @param _lpTokenName Name for LP token
     * @param _lpTokenSymbol Symbol for LP token
     * @param _A Amplification coefficient
     * @param _fee Swap fee
     */
    constructor(
        address[N_COINS] memory _coins,
        string memory _lpTokenName,
        string memory _lpTokenSymbol,
        uint256 _A,
        uint256 _fee
    ) Ownable(msg.sender) {
        require(_coins[0] != address(0), "StableSwapAMM: invalid coin 0");
        require(_A > 0 && _A < 1e6, "StableSwapAMM: invalid A");
        require(_fee < MAX_FEE, "StableSwapAMM: fee too high");
        
        coins = _coins;
        lpTokenName = _lpTokenName;
        lpTokenSymbol = _lpTokenSymbol;
        A = _A;
        fee = _fee;
        adminFee = ADMIN_FEE;
        
        // Initialize rate multipliers (for different decimal tokens)
        // Default to 1e18 - should be adjusted based on token decimals
        for (uint256 i = 0; i < N_COINS; i++) {
            rateMultipliers[i] = PRECISION;
            rates[i] = PRECISION;
        }
        
        // Create LP token
        lpToken = new LPToken(_lpTokenName, _lpTokenSymbol, address(this));
    }

    // ============ Swap Functions ============
    
    /**
     * @dev Exchange between two coins
     * @param i Index of coin to sell
     * @param j Index of coin to buy
     * @param dx Amount to sell
     * @param minDy Minimum amount to receive
     * @return Actual amount received
     */
    function exchange(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 minDy
    ) external whenNotPaused returns (uint256) {
        require(i != j, "StableSwapAMM: same coin");
        require(i < N_COINS && j < N_COINS, "StableSwapAMM: invalid coin index");
        
        uint256[N_COINS] memory rates_;
        for (uint256 k = 0; k < N_COINS; k++) {
            rates_[k] = rates[k];
        }
        
        // Calculate output amount
        uint256 dy = _get_dy(i, j, dx, rates_);
        
        require(dy >= minDy, "StableSwapAMM: dy < minDy");
        
        // Perform the transfer
        IERC20(coins[uint256(i)]).safeTransferFrom(msg.sender, address(this), dx);
        IERC20(coins[uint256(j)]).safeTransfer(msg.sender, dy);
        
        // Update balances
        balances[uint256(i)] += dx;
        balances[uint256(j)] -= dy;
        
        // Update rates
        _updateRates();
        
        emit TokenExchange(msg.sender, uint256(i), dx, uint256(j), dy);
        
        return dy;
    }

    /**
     * @dev Get amount received for exchange
     * @param i Index of coin to sell
     * @param j Index of coin to buy
     * @param dx Amount to sell
     * @return Expected amount received
     */
    function get_dy(uint256 i, uint256 j, uint256 dx) external view returns (uint256) {
        uint256[N_COINS] memory rates_;
        for (uint256 k = 0; k < N_COINS; k++) {
            rates_[k] = rates[k];
        }
        return _get_dy(i, j, dx, rates_);
    }

    /**
     * @dev Internal function to calculate exchange output
     */
    function _get_dy(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256[N_COINS] memory rates_
    ) internal view returns (uint256) {
        uint256[N_COINS] memory xp = _xp_mem(rates_);
        
        uint256 x = xp[i] + (dx * rates_[i] / PRECISION);
        uint256 y = _get_y(i, j, x, xp);
        
        uint256 dy = (xp[j] - y) * PRECISION / rates_[j];
        
        // Apply fee
        uint256 feeAmount = (dy * fee) / 1e10;
        return dy - feeAmount;
    }

    /**
     * @dev Calculate new y given x
     */
    function _get_y(
        uint256 i,
        uint256 j,
        uint256 x,
        uint256[N_COINS] memory xp
    ) internal view returns (uint256) {
        // Solve: x + D = (D * N^N + A * N^N * x) / (A * N^N * x + D)
        // Using Newton's method
        
        uint256 D = _get_D(xp, A);
        
        uint256 S_ = 0;
        uint256 S_x = 0;
        
        for (uint256 k = 0; k < N_COINS; k++) {
            if (k == i) {
                S_ += xp[k];
                S_x += xp[k] * x;
            } else if (k != j) {
                S_ += xp[k];
                S_x += xp[k] * xp[k];
            } else {
                S_ += xp[k];
            }
        }
        
        // Calculate x_j = (D * D / (N * S_)) * x_j / (D / S_ + (A - 1) * (x - D) / D)
        
        uint256 c = (D * D) / (N_COINS * S_);
        uint256 b = x + (D * A_PRECISION / A) - (D / N_COINS);
        
        uint256 yPrev = 0;
        uint256 y = D;
        
        for (uint256 iter = 0; iter < 255; iter++) {
            yPrev = y;
            y = (c / b + (D * A_PRECISION / A)) / (D / N_COINS);
            if (y > yPrev) {
                if (y - yPrev <= 1) break;
            } else {
                if (yPrev - y <= 1) break;
            }
        }
        
        return y;
    }

    /**
     * @dev Calculate D (invariant)
     */
    function _get_D(uint256[N_COINS] memory xp, uint256 A_) internal pure returns (uint256) {
        uint256 S = 0;
        for (uint256 k = 0; k < N_COINS; k++) {
            S += xp[k];
        }
        if (S == 0) return 0;
        
        uint256 D = S;
        uint256 Dprev = 0;
        
        for (uint256 iter = 0; iter < 255; iter++) {
            uint256 D_P = D;
            for (uint256 k = 0; k < N_COINS; k++) {
                D_P = (D_P * D) / (xp[k] * N_COINS + 1);
            }
            Dprev = D;
            D = ((A_ * S / A_PRECISION + D_P * N_COINS) * D) / ((A_ * S / A_PRECISION - D_P) * (N_COINS - 1) / N_COINS + D_P);
            
            if (D > Dprev) {
                if (D - Dprev <= 1) break;
            } else {
                if (Dprev - D <= 1) break;
            }
        }
        
        return D;
    }

    /**
     * @dev Calculate xp (scaled balances)
     */
    function _xp_mem(uint256[N_COINS] memory rates_) internal view returns (uint256[N_COINS] memory) {
        uint256[N_COINS] memory xp;
        for (uint256 k = 0; k < N_COINS; k++) {
            xp[k] = rates_[k] * balances[k] / PRECISION;
        }
        return xp;
    }

    // ============ Liquidity Functions ============
    
    /**
     * @dev Add liquidity
     * @param amounts Array of amounts for each coin
     * @param minMintAmount Minimum LP tokens to receive
     * @return Amount of LP tokens minted
     */
    function addLiquidity(
        uint256[N_COINS] calldata amounts,
        uint256 minMintAmount
    ) external whenNotPaused returns (uint256) {
        uint256[N_COINS] memory fees;
        uint256 mintAmount = 0;
        
        // Get current invariant
        uint256[N_COINS] memory rates_;
        for (uint256 k = 0; k < N_COINS; k++) {
            rates_[k] = rates[k];
        }
        
        uint256 D0 = 0;
        if (totalSupply > 0) {
            D0 = _get_D(_xp_mem(rates_), A);
        }
        
        // Calculate new invariant after deposit
        uint256[N_COINS] memory newBalances = balances;
        for (uint256 i = 0; i < N_COINS; i++) {
            if (totalSupply > 0) {
                // Charge fee on deposits
                if (amounts[i] > 0) {
                    uint256 feeAmount = (amounts[i] * fee) / 1e10;
                    fees[i] = feeAmount;
                    newBalances[i] += amounts[i] - feeAmount;
                }
            } else {
                require(amounts[i] > 0, "StableSwapAMM: initial deposit must be > 0");
                newBalances[i] += amounts[i];
            }
        }
        
        uint256 D1 = _get_D(_xp_mem_rates(newBalances, rates_), A);
        require(D1 > D0, "StableSwapAMM: D1 <= D0");
        
        // Calculate mint amount
        if (totalSupply == 0) {
            mintAmount = D1;
        } else {
            uint256 diff = D1 - D0;
            mintAmount = (totalSupply * diff) / D0;
        }
        
        require(mintAmount >= minMintAmount, "StableSwapAMM: mintAmount < minMintAmount");
        
        // Transfer tokens
        for (uint256 i = 0; i < N_COINS; i++) {
            if (amounts[i] > 0) {
                IERC20(coins[i]).safeTransferFrom(msg.sender, address(this), amounts[i]);
                balances[i] += amounts[i];
            }
        }
        
        // Mint LP tokens
        lpToken.mint(msg.sender, mintAmount);
        totalSupply += mintAmount;
        
        // Update rates
        _updateRates();
        
        emit AddLiquidity(msg.sender, amounts, mintAmount);
        
        return mintAmount;
    }

    /**
     * @dev Remove liquidity
     * @param amount Amount of LP tokens to burn
     * @param minAmounts Minimum amounts to receive for each coin
     * @return Actual amounts received
     */
    function removeLiquidity(
        uint256 amount,
        uint256[N_COINS] calldata minAmounts
    ) external returns (uint256[N_COINS] memory) {
        require(amount > 0, "StableSwapAMM: amount must be > 0");
        require(amount <= lpToken.balanceOf(msg.sender), "StableSwapAMM: insufficient balance");
        
        uint256[N_COINS] memory amounts;
        uint256 totalLP = totalSupply;
        
        for (uint256 i = 0; i < N_COINS; i++) {
            uint256 balance = balances[i];
            amounts[i] = (balance * amount) / totalLP;
            require(amounts[i] >= minAmounts[i], "StableSwapAMM: amount < minAmount");
            balances[i] -= amounts[i];
            IERC20(coins[i]).safeTransfer(msg.sender, amounts[i]);
        }
        
        // Burn LP tokens
        lpToken.burnFrom(msg.sender, amount);
        totalSupply -= amount;
        
        // Update rates
        _updateRates();
        
        emit RemoveLiquidity(msg.sender, amounts, amount);
        
        return amounts;
    }

    /**
     * @dev Remove liquidity in one coin
     * @param amount Amount of LP tokens to burn
     * @param i Index of coin to receive
     * @param minAmount Minimum amount to receive
     * @return Amount received
     */
    function removeLiquidityOneToken(
        uint256 amount,
        uint256 i,
        uint256 minAmount
    ) external returns (uint256) {
        require(amount > 0, "StableSwapAMM: amount must be > 0");
        require(i < N_COINS, "StableSwapAMM: invalid coin index");
        
        uint256 totalLP = totalSupply;
        uint256 dy = (balances[i] * amount) / totalLP;
        require(dy >= minAmount, "StableSwapAMM: dy < minAmount");
        
        balances[i] -= dy;
        lpToken.burnFrom(msg.sender, amount);
        totalSupply -= amount;
        
        IERC20(coins[i]).safeTransfer(msg.sender, dy);
        
        // Update rates
        _updateRates();
        
        emit RemoveLiquidityOne(msg.sender, amount, dy);
        
        return dy;
    }

    // ============ View Functions ============
    
    /**
     * @dev Calculate current LP token supply for given amounts
     */
    function calcTokenAmount(uint256[N_COINS] calldata amounts, bool deposit) external view returns (uint256) {
        uint256[N_COINS] memory rates_;
        for (uint256 k = 0; k < N_COINS; k++) {
            rates_[k] = rates[k];
        }
        
        uint256 D0 = 0;
        if (totalSupply > 0) {
            D0 = _get_D(_xp_mem(rates_), A);
        }
        
        uint256[N_COINS] memory newBalances = balances;
        for (uint256 i = 0; i < N_COINS; i++) {
            if (totalSupply > 0) {
                newBalances[i] += deposit ? amounts[i] : 0;
            } else {
                require(amounts[i] > 0, "StableSwapAMM: initial deposit must be > 0");
                newBalances[i] = amounts[i];
            }
        }
        
        uint256 D1 = _get_D(_xp_mem_rates(newBalances, rates_), A);
        
        if (totalSupply == 0) {
            return D1;
        }
        
        uint256 diff = D1 - D0;
        return (totalSupply * diff) / D0;
    }

    /**
     * @dev Get virtual price (for calculating LP value)
     */
    function getVirtualPrice() external view returns (uint256) {
        if (totalSupply == 0) return PRECISION;
        
        uint256[N_COINS] memory rates_;
        for (uint256 k = 0; k < N_COINS; k++) {
            rates_[k] = rates[k];
        }
        
        uint256 D = _get_D(_xp_mem(rates_), A);
        return (D * PRECISION) / totalSupply;
    }

    /**
     * @dev Get pool balances
     */
    function getBalances() external view returns (uint256[N_COINS] memory) {
        return balances;
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Update amplification coefficient (A)
     * @param futureA New A value
     * @param futureTime Time when ramp ends
     */
    function rampA(uint256 futureA, uint256 futureTime) external onlyOwner {
        require(block.timestamp >= futureTime - 86400, "StableSwapAMM: insufficient time");
        require(futureA > 0 && futureA < 1e6, "StableSwapAMM: invalid futureA");
        
        uint256 currentA = A;
        uint256 currentTime = block.timestamp;
        
        require(futureTime > currentTime, "StableSwapAMM: futureTime must be in future");
        require(futureTime <= currentTime + 864000, "StableSwapAMM: max ramp time");
        
        // A is ramping linearly
        // We store the future A but it only takes effect after futureTime
        A = futureA;
        
        emit RampA(currentA, futureA, currentTime, futureTime);
    }

    /**
     * @dev Stop A ramp
     */
    function stopRampA() external onlyOwner {
        A = A; // Keep current value
        emit StopRampA(A);
    }

    /**
     * @dev Update swap fee
     */
    function setFee(uint256 newFee) external onlyOwner {
        require(newFee < MAX_FEE, "StableSwapAMM: fee too high");
        fee = newFee;
        emit FeeUpdated(newFee);
    }

    /**
     * @dev Update admin fee
     */
    function setAdminFee(uint256 newAdminFee) external onlyOwner {
        require(newAdminFee <= 1e10, "StableSwapAMM: admin fee too high");
        adminFee = newAdminFee;
        emit AdminFeeUpdated(newAdminFee);
    }

    /**
     * @dev Set rate multiplier for a coin (for different decimals)
     */
    function setRateMultiplier(uint256 i, uint256 multiplier) external onlyOwner {
        require(i < N_COINS, "StableSwapAMM: invalid coin index");
        rateMultipliers[i] = multiplier;
    }

    // ============ Internal Functions ============
    
    /**
     * @dev Update rates based on current balances
     */
    function _updateRates() internal {
        for (uint256 i = 0; i < N_COINS; i++) {
            rates[i] = rateMultipliers[i];
        }
    }

    /**
     * @dev Helper for xp with rates
     */
    function _xp_mem_rates(
        uint256[N_COINS] memory balances_,
        uint256[N_COINS] memory rates_
    ) internal view returns (uint256[N_COINS] memory) {
        uint256[N_COINS] memory xp;
        for (uint256 k = 0; k < N_COINS; k++) {
            xp[k] = rates_[k] * balances_[k] / PRECISION;
        }
        return xp;
    }

    // ============ Pause Functions ============
    
    function pause() external onlyOwner {
        isPaused = true;
    }

    function unpause() external onlyOwner {
        isPaused = false;
    }
}

/**
 * @title LPToken
 * @dev Liquidity Provider Token
 */
contract LPToken is ERC20, ILPToken {
    address public minter;
    address public swapPool;
    
    modifier onlyMinter() {
        require(msg.sender == minter, "LPToken: not minter");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        address _swapPool
    ) ERC20(name, symbol) {
        minter = msg.sender;
        swapPool = _swapPool;
    }
    
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
    
    function burnFrom(address account, uint256 amount) external onlyMinter {
        _burn(account, amount);
    }
}
