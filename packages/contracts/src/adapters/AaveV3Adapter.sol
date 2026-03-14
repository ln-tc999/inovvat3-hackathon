// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ILendingAdapter} from "../interfaces/ILendingAdapter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getReserveData(address asset) external view returns (
        uint256 configuration,
        uint128 liquidityIndex,
        uint128 currentLiquidityRate,
        uint128 variableBorrowIndex,
        uint128 currentVariableBorrowRate,
        uint128 currentStableBorrowRate,
        uint40 lastUpdateTimestamp,
        uint16 id,
        address aTokenAddress,
        address stableDebtTokenAddress,
        address variableDebtTokenAddress,
        address interestRateStrategyAddress,
        uint128 accruedToTreasury,
        uint128 unbacked,
        uint128 isolationModeTotalDebt
    );
}

/// @title AaveV3Adapter
/// @notice Wraps Aave V3 supply/withdraw for the YieldOptimizerCore
contract AaveV3Adapter is ILendingAdapter {
    using SafeERC20 for IERC20;

    IAavePool public immutable pool;
    address public immutable core; // only YieldOptimizerCore can call

    error OnlyCore();

    modifier onlyCore() {
        if (msg.sender != core) revert OnlyCore();
        _;
    }

    constructor(address _pool, address _core) {
        pool = IAavePool(_pool);
        core = _core;
    }

    function supply(address asset, uint256 amount, address onBehalfOf) external onlyCore {
        IERC20(asset).safeTransferFrom(onBehalfOf, address(this), amount);
        IERC20(asset).forceApprove(address(pool), amount);
        pool.supply(asset, amount, onBehalfOf, 0);
    }

    function withdraw(address asset, uint256 amount, address to) external onlyCore returns (uint256) {
        return pool.withdraw(asset, amount, to);
    }

    /// @notice Returns current liquidity rate in basis points
    function getAPY(address asset) external view returns (uint256) {
        (,,,,,,,,,,,,,, ) = pool.getReserveData(asset); // silence unused warning
        // currentLiquidityRate is ray (1e27), convert to bps (1e4)
        (, , uint128 currentLiquidityRate, , , , , , , , , , , ,) = pool.getReserveData(asset);
        return uint256(currentLiquidityRate) / 1e23; // ray → bps
    }

    function getBalance(address asset, address user) external view returns (uint256) {
        // aToken balance = supplied balance
        (, , , , , , , , address aTokenAddress, , , , , ,) = pool.getReserveData(asset);
        return IERC20(aTokenAddress).balanceOf(user);
    }
}
