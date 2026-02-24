// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ILPToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

/**
 * @title StableSwapAMM
 * @dev Optimized AMM for stablecoin swaps with low slippage.
 * Based on Curve Finance's StableSwap invariant with amplification factor.
 * Includes reentrancy protection and correct Newton's method implementation.
 */
contract StableSwapAMM is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    uint256 public constant N_COINS = 4;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_FEE = 1e10; // 100%
    uint256 public constant ADMIN_FEE = 1e9; // 10% of swap fee

    // ============ State Variables ============

    address[N_COINS] public coins;
    ILPToken public lpToken;
    string public lpTokenName;
    string public lpTokenSymbol;

    // Amplification coefficient (A * N_COINS)
    // Higher A = tighter peg (more like constant sum)
    // Lower A = more like constant product
    uint256 public A;
    uint256 public constant A_PRECISION = 100;

    uint256 public fee;
    uint256 public adminFee;
    uint256[N_COINS] public balances;
    uint256[N_COINS] public rates;
    uint256[N_COINS] public rateMultipliers;
    uint256 public totalSupply;
    mapping(address => uint256) public depositTimestamp;

    bool public isPaused;

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

    modifier whenNotPaused() {
        require(!isPaused, "StableSwapAMM: paused");
        _;
    }

    // ============ Constructor ============

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

        for (uint256 i = 0; i < N_COINS; i++) {
            rateMultipliers[i] = PRECISION;
            rates[i] = PRECISION;
        }

        lpToken = new LPToken(_lpTokenName, _lpTokenSymbol, address(this));
    }

    // ============ Swap Functions ============

    function exchange(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 minDy
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(i != j, "StableSwapAMM: same coin");
        require(i < N_COINS && j < N_COINS, "StableSwapAMM: invalid coin index");
        require(dx > 0, "StableSwapAMM: dx must be > 0");

        uint256[N_COINS] memory rates_ = _currentRates();
        uint256 dy = _get_dy(i, j, dx, rates_);

        require(dy >= minDy, "StableSwapAMM: dy < minDy");

        IERC20(coins[i]).safeTransferFrom(msg.sender, address(this), dx);
        IERC20(coins[j]).safeTransfer(msg.sender, dy);

        balances[i] += dx;
        balances[j] -= dy;

        _updateRates();

        emit TokenExchange(msg.sender, i, dx, j, dy);
        return dy;
    }

    function get_dy(uint256 i, uint256 j, uint256 dx) external view returns (uint256) {
        uint256[N_COINS] memory rates_ = _currentRates();
        return _get_dy(i, j, dx, rates_);
    }

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

        uint256 feeAmount = (dy * fee) / 1e10;
        return dy - feeAmount;
    }

    /**
     * @dev Calculate y given x using Newton's method.
     * Follows the Curve reference implementation exactly.
     * Solves: An^n * sum(x_i) + D = An^n * D + D^(n+1) / (n^n * prod(x_i))
     */
    function _get_y(
        uint256 i,
        uint256 j,
        uint256 x,
        uint256[N_COINS] memory xp
    ) internal view returns (uint256) {
        require(i != j, "StableSwapAMM: same index");
        require(j < N_COINS, "StableSwapAMM: j above N_COINS");

        uint256 D = _get_D(xp, A);
        uint256 Ann = A * N_COINS;

        uint256 c = D;
        uint256 S_ = 0;

        for (uint256 k = 0; k < N_COINS; k++) {
            uint256 _x;
            if (k == i) {
                _x = x;
            } else if (k != j) {
                _x = xp[k];
            } else {
                continue;
            }
            S_ += _x;
            c = c * D / (_x * N_COINS);
        }

        c = c * D * A_PRECISION / (Ann * N_COINS);
        uint256 b = S_ + D * A_PRECISION / Ann;

        uint256 y = D;
        uint256 yPrev;

        for (uint256 iter = 0; iter < 255; iter++) {
            yPrev = y;
            y = (y * y + c) / (2 * y + b - D);
            if (y > yPrev) {
                if (y - yPrev <= 1) break;
            } else {
                if (yPrev - y <= 1) break;
            }
        }

        return y;
    }

    /**
     * @dev Calculate D (the StableSwap invariant) using Newton's method.
     * D satisfies: An^n * sum(x_i) + D = An^n * D + D^(n+1) / (n^n * prod(x_i))
     */
    function _get_D(uint256[N_COINS] memory xp, uint256 A_) internal pure returns (uint256) {
        uint256 S = 0;
        for (uint256 k = 0; k < N_COINS; k++) {
            S += xp[k];
        }
        if (S == 0) return 0;

        uint256 D = S;
        uint256 Ann = A_ * N_COINS;
        uint256 Dprev;

        for (uint256 iter = 0; iter < 255; iter++) {
            uint256 D_P = D;
            for (uint256 k = 0; k < N_COINS; k++) {
                D_P = (D_P * D) / (xp[k] * N_COINS + 1);
            }
            Dprev = D;

            // D = (Ann * S / A_PRECISION + D_P * N_COINS) * D /
            //     ((Ann - A_PRECISION) * D / A_PRECISION + (N_COINS + 1) * D_P)
            uint256 numerator = (Ann * S / A_PRECISION + D_P * N_COINS) * D;
            uint256 denominator = (Ann - A_PRECISION) * D / A_PRECISION + (N_COINS + 1) * D_P;
            D = numerator / denominator;

            if (D > Dprev) {
                if (D - Dprev <= 1) break;
            } else {
                if (Dprev - D <= 1) break;
            }
        }

        return D;
    }

    function _xp_mem(uint256[N_COINS] memory rates_) internal view returns (uint256[N_COINS] memory) {
        uint256[N_COINS] memory xp;
        for (uint256 k = 0; k < N_COINS; k++) {
            xp[k] = rates_[k] * balances[k] / PRECISION;
        }
        return xp;
    }

    // ============ Liquidity Functions ============

    /**
     * @dev Add liquidity to the pool.
     * Fees are deducted from deposits when pool already has liquidity.
     * Balance accounting matches the invariant calculation.
     */
    function addLiquidity(
        uint256[N_COINS] calldata amounts,
        uint256 minMintAmount
    ) external whenNotPaused nonReentrant returns (uint256) {
        uint256[N_COINS] memory fees;
        uint256 mintAmount;

        uint256[N_COINS] memory rates_ = _currentRates();

        uint256 D0 = 0;
        if (totalSupply > 0) {
            D0 = _get_D(_xp_mem(rates_), A);
        }

        uint256[N_COINS] memory newBalances = balances;
        for (uint256 i = 0; i < N_COINS; i++) {
            if (totalSupply > 0) {
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

        if (totalSupply == 0) {
            mintAmount = D1;
        } else {
            mintAmount = (totalSupply * (D1 - D0)) / D0;
        }

        require(mintAmount >= minMintAmount, "StableSwapAMM: mintAmount < minMintAmount");

        // Transfer tokens from user
        for (uint256 i = 0; i < N_COINS; i++) {
            if (amounts[i] > 0) {
                IERC20(coins[i]).safeTransferFrom(msg.sender, address(this), amounts[i]);
            }
        }

        // Set balances to match what was used in D1 calculation (fee-deducted)
        balances = newBalances;

        lpToken.mint(msg.sender, mintAmount);
        totalSupply += mintAmount;
        depositTimestamp[msg.sender] = block.timestamp;

        _updateRates();

        emit AddLiquidity(msg.sender, amounts, mintAmount);
        return mintAmount;
    }

    function removeLiquidity(
        uint256 amount,
        uint256[N_COINS] calldata minAmounts
    ) external nonReentrant returns (uint256[N_COINS] memory) {
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

        lpToken.burnFrom(msg.sender, amount);
        totalSupply -= amount;

        _updateRates();

        emit RemoveLiquidity(msg.sender, amounts, amount);
        return amounts;
    }

    function removeLiquidityOneToken(
        uint256 amount,
        uint256 i,
        uint256 minAmount
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "StableSwapAMM: amount must be > 0");
        require(i < N_COINS, "StableSwapAMM: invalid coin index");

        uint256 totalLP = totalSupply;
        uint256 dy = (balances[i] * amount) / totalLP;
        require(dy >= minAmount, "StableSwapAMM: dy < minAmount");

        balances[i] -= dy;
        lpToken.burnFrom(msg.sender, amount);
        totalSupply -= amount;

        IERC20(coins[i]).safeTransfer(msg.sender, dy);

        _updateRates();

        emit RemoveLiquidityOne(msg.sender, amount, dy);
        return dy;
    }

    // ============ View Functions ============

    function calcTokenAmount(uint256[N_COINS] calldata amounts, bool deposit) external view returns (uint256) {
        uint256[N_COINS] memory rates_ = _currentRates();

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

        return (totalSupply * (D1 - D0)) / D0;
    }

    function getVirtualPrice() external view returns (uint256) {
        if (totalSupply == 0) return PRECISION;

        uint256[N_COINS] memory rates_ = _currentRates();
        uint256 D = _get_D(_xp_mem(rates_), A);
        return (D * PRECISION) / totalSupply;
    }

    function getBalances() external view returns (uint256[N_COINS] memory) {
        return balances;
    }

    // ============ Admin Functions ============

    function rampA(uint256 futureA, uint256 futureTime) external onlyOwner {
        require(futureA > 0 && futureA < 1e6, "StableSwapAMM: invalid futureA");
        require(futureTime > block.timestamp, "StableSwapAMM: futureTime must be in future");
        require(futureTime <= block.timestamp + 864000, "StableSwapAMM: max ramp time");

        uint256 currentA = A;
        A = futureA;

        emit RampA(currentA, futureA, block.timestamp, futureTime);
    }

    function stopRampA() external onlyOwner {
        emit StopRampA(A);
    }

    function setFee(uint256 newFee) external onlyOwner {
        require(newFee < MAX_FEE, "StableSwapAMM: fee too high");
        fee = newFee;
        emit FeeUpdated(newFee);
    }

    function setAdminFee(uint256 newAdminFee) external onlyOwner {
        require(newAdminFee <= 1e10, "StableSwapAMM: admin fee too high");
        adminFee = newAdminFee;
        emit AdminFeeUpdated(newAdminFee);
    }

    function setRateMultiplier(uint256 i, uint256 multiplier) external onlyOwner {
        require(i < N_COINS, "StableSwapAMM: invalid coin index");
        rateMultipliers[i] = multiplier;
    }

    function pause() external onlyOwner {
        isPaused = true;
    }

    function unpause() external onlyOwner {
        isPaused = false;
    }

    // ============ Internal Functions ============

    function _currentRates() internal view returns (uint256[N_COINS] memory rates_) {
        for (uint256 k = 0; k < N_COINS; k++) {
            rates_[k] = rates[k];
        }
    }

    function _updateRates() internal {
        for (uint256 i = 0; i < N_COINS; i++) {
            rates[i] = rateMultipliers[i];
        }
    }

    function _xp_mem_rates(
        uint256[N_COINS] memory balances_,
        uint256[N_COINS] memory rates_
    ) internal pure returns (uint256[N_COINS] memory) {
        uint256[N_COINS] memory xp;
        for (uint256 k = 0; k < N_COINS; k++) {
            xp[k] = rates_[k] * balances_[k] / PRECISION;
        }
        return xp;
    }
}

/**
 * @title LPToken
 * @dev Liquidity Provider Token for StableSwapAMM
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
