// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ILendingAdapter} from "../interfaces/ILendingAdapter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IMorpho {
    struct MarketParams {
        address loanToken;
        address collateralToken;
        address oracle;
        address irm;
        uint256 lltv;
    }
    function supply(
        MarketParams calldata marketParams,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        bytes calldata data
    ) external returns (uint256 assetsSupplied, uint256 sharesSupplied);

    function withdraw(
        MarketParams calldata marketParams,
        uint256 assets,
        uint256 shares,
        address onBehalf,
        address receiver
    ) external returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn);
}

/// @title MorphoAdapter
/// @notice Wraps Morpho Blue supply/withdraw
contract MorphoAdapter is ILendingAdapter {
    using SafeERC20 for IERC20;

    IMorpho public immutable morpho;
    address public immutable core;

    // Default market params for USDC on Base (set at deploy)
    IMorpho.MarketParams public defaultMarket;

    error OnlyCore();

    modifier onlyCore() {
        if (msg.sender != core) revert OnlyCore();
        _;
    }

    constructor(address _morpho, address _core, IMorpho.MarketParams memory _defaultMarket) {
        morpho = IMorpho(_morpho);
        core = _core;
        defaultMarket = _defaultMarket;
    }

    function supply(address asset, uint256 amount, address onBehalfOf) external onlyCore {
        IERC20(asset).safeTransferFrom(onBehalfOf, address(this), amount);
        IERC20(asset).forceApprove(address(morpho), amount);
        morpho.supply(defaultMarket, amount, 0, onBehalfOf, "");
    }

    function withdraw(address asset, uint256 amount, address to) external onlyCore returns (uint256) {
        (uint256 withdrawn,) = morpho.withdraw(defaultMarket, amount, 0, to, to);
        return withdrawn;
    }

    /// @notice Morpho APY is computed off-chain; return 0 as placeholder (fetched via Chainlink Functions)
    function getAPY(address) external pure returns (uint256) {
        return 0;
    }

    function getBalance(address asset, address user) external view returns (uint256) {
        return IERC20(asset).balanceOf(user);
    }
}
