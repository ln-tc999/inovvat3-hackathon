// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MockERC20} from "./MockERC20.sol";

/// @notice Minimal Aave V3 Pool mock — holds tokens and issues aTokens
contract MockAavePool {
    using SafeERC20 for IERC20;

    // asset => aToken
    mapping(address => address) public aTokens;
    // fixed 4.5% APY in ray (1e27)
    uint128 public constant MOCK_LIQUIDITY_RATE = 45_000_000_000_000_000_000_000_000; // 4.5% in ray

    event Supply(address indexed asset, uint256 amount, address indexed onBehalfOf);
    event Withdraw(address indexed asset, uint256 amount, address indexed to);

    /// @notice Register an aToken for an asset (called during setup)
    function setAToken(address asset, address aToken) external {
        aTokens[asset] = aToken;
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        MockERC20(aTokens[asset]).mint(onBehalfOf, amount);
        emit Supply(asset, amount, onBehalfOf);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        // Burn aTokens from caller, return underlying
        // In real Aave, aTokens are burned from msg.sender
        // Here we just transfer underlying back
        IERC20(asset).safeTransfer(to, amount);
        emit Withdraw(asset, amount, to);
        return amount;
    }

    function getReserveData(address asset) external view returns (
        uint256, uint128, uint128, uint128, uint128, uint128,
        uint40, uint16, address, address, address, address, uint128, uint128, uint128
    ) {
        return (
            0,                    // configuration
            1e27,                 // liquidityIndex (ray)
            MOCK_LIQUIDITY_RATE,  // currentLiquidityRate — 4.5% APY
            1e27,                 // variableBorrowIndex
            0, 0,                 // variable/stable borrow rates
            uint40(block.timestamp),
            1,                    // id
            aTokens[asset],       // aTokenAddress
            address(0), address(0), address(0),
            0, 0, 0
        );
    }
}
