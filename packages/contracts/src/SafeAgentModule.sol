// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AgentPolicy} from "./AgentPolicy.sol";

/// @notice Minimal Safe interface needed for module execution
interface ISafe {
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) external returns (bool success);
    function isOwner(address owner) external view returns (bool);
}

/// @title SafeAgentModule
/// @notice Safe module that allows the YieldOptimizerCore to execute transactions
///         on behalf of the Safe, within policy constraints
contract SafeAgentModule {
    AgentPolicy public immutable policy;
    address public immutable core;

    event ModuleEnabled(address indexed safe);
    event ModuleDisabled(address indexed safe);

    error NotSafeOwner();
    error ExecutionFailed();
    error PolicyViolation();

    mapping(address => bool) public enabledSafes;

    constructor(address _policy, address _core) {
        policy = AgentPolicy(_policy);
        core = _core;
    }

    /// @notice Safe owner enables this module for their Safe
    function enableModule(address safe) external {
        if (!ISafe(safe).isOwner(msg.sender)) revert NotSafeOwner();
        enabledSafes[safe] = true;
        emit ModuleEnabled(safe);
    }

    /// @notice Safe owner disables (kill switch)
    function disableModule(address safe) external {
        if (!ISafe(safe).isOwner(msg.sender)) revert NotSafeOwner();
        enabledSafes[safe] = false;
        // Also pause agent policy
        // Note: policy.pauseAgent() must be called by the safe itself or owner
        emit ModuleDisabled(safe);
    }

    /// @notice Execute a call from the Safe via this module (called by YieldOptimizerCore)
    function executeFromSafe(
        address safe,
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool) {
        if (msg.sender != core) revert NotSafeOwner();
        if (!enabledSafes[safe]) revert PolicyViolation();

        bool success = ISafe(safe).execTransactionFromModule(to, value, data, 0);
        if (!success) revert ExecutionFailed();
        return true;
    }
}
