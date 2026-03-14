// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Common interface for all lending protocol adapters
interface ILendingAdapter {
    function supply(address asset, uint256 amount, address onBehalfOf) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getAPY(address asset) external view returns (uint256); // in basis points (1e4 = 100%)
    function getBalance(address asset, address user) external view returns (uint256);
}
