// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ILendingAdapter} from "./interfaces/ILendingAdapter.sol";
import {AgentPolicy} from "./AgentPolicy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title YieldOptimizerCore
/// @notice Parses LLM decision JSON (delivered by Chainlink Functions) and executes batch yield actions
/// @dev Receives structured action array; validates against AgentPolicy before each execution
contract YieldOptimizerCore is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Types ───────────────────────────────────────────────────────────────
    enum ActionType { SUPPLY, WITHDRAW, REBALANCE }

    struct YieldAction {
        address protocol;   // adapter address
        ActionType action;
        address asset;
        uint256 amount;     // 0 = "all" (use full balance)
    }

    // ─── State ───────────────────────────────────────────────────────────────
    AgentPolicy public immutable policy;
    address public immutable chainlinkAutomation;
    address public immutable chainlinkFunctionsConsumer;
    bool public paused;
    address public owner;

    mapping(address => bool) public registeredAdapters;

    // ─── Events ──────────────────────────────────────────────────────────────
    event ActionsExecuted(address indexed user, uint256 actionsCount);
    event AdapterRegistered(address indexed adapter, bool status);
    event Paused(bool status);

    // ─── Errors ──────────────────────────────────────────────────────────────
    error NotAuthorized();
    error ContractPaused();
    error AdapterNotRegistered();
    error InvalidAction();

    modifier onlyAutomation() {
        if (msg.sender != chainlinkAutomation && msg.sender != chainlinkFunctionsConsumer)
            revert NotAuthorized();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    modifier onlyAuthorized() {
        if (
            msg.sender != chainlinkAutomation &&
            msg.sender != chainlinkFunctionsConsumer &&
            msg.sender != owner
        ) revert NotAuthorized();
        _;
    }

    constructor(
        address _policy,
        address _chainlinkAutomation,
        address _chainlinkFunctionsConsumer
    ) {
        policy = AgentPolicy(_policy);
        chainlinkAutomation = _chainlinkAutomation;
        chainlinkFunctionsConsumer = _chainlinkFunctionsConsumer;
        owner = msg.sender;
    }

    // ─── Admin ───────────────────────────────────────────────────────────────
    function registerAdapter(address adapter, bool status) external onlyOwner {
        registeredAdapters[adapter] = status;
        emit AdapterRegistered(adapter, status);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    // ─── Core Execution ──────────────────────────────────────────────────────
    /// @notice Execute a batch of yield actions for a user (called by Chainlink — validates policy)
    function executeBatch(
        address user,
        YieldAction[] calldata actions
    ) external nonReentrant whenNotPaused onlyAutomation {
        uint256 len = actions.length;
        for (uint256 i = 0; i < len; ) {
            _executeActionWithPolicy(user, actions[i]);
            unchecked { ++i; }
        }
        emit ActionsExecuted(user, len);
    }

    /// @notice Execute a batch manually — callable by owner (backend wallet), skips policy check
    function executeManual(
        address user,
        YieldAction[] calldata actions
    ) external nonReentrant whenNotPaused onlyAuthorized {
        uint256 len = actions.length;
        for (uint256 i = 0; i < len; ) {
            _executeAction(user, actions[i]);
            unchecked { ++i; }
        }
        emit ActionsExecuted(user, len);
    }

    function _executeBatchInternal(address user, YieldAction[] calldata actions) internal {
        uint256 len = actions.length;
        for (uint256 i = 0; i < len; ) {
            _executeAction(user, actions[i]);
            unchecked { ++i; }
        }
        emit ActionsExecuted(user, len);
    }

    function _executeAction(address user, YieldAction calldata action) internal {
        if (!registeredAdapters[action.protocol]) revert AdapterNotRegistered();

        uint256 amount = action.amount;
        // "all" = use full balance
        if (amount == 0) {
            amount = IERC20(action.asset).balanceOf(user);
        }

        ILendingAdapter adapter = ILendingAdapter(action.protocol);

        if (action.action == ActionType.SUPPLY) {
            adapter.supply(action.asset, amount, user);
        } else if (action.action == ActionType.WITHDRAW) {
            adapter.withdraw(action.asset, amount, user);
        } else if (action.action == ActionType.REBALANCE) {
            revert InvalidAction();
        }
    }

    /// @notice Internal execution with policy validation (used by Chainlink paths)
    function _executeActionWithPolicy(address user, YieldAction calldata action) internal {
        if (!registeredAdapters[action.protocol]) revert AdapterNotRegistered();

        uint256 amount = action.amount;
        if (amount == 0) {
            amount = IERC20(action.asset).balanceOf(user);
        }

        // Validate against policy (checks daily limit, allowlist, session expiry)
        policy.validateAction(user, action.protocol, amount);

        ILendingAdapter adapter = ILendingAdapter(action.protocol);

        if (action.action == ActionType.SUPPLY) {
            adapter.supply(action.asset, amount, user);
        } else if (action.action == ActionType.WITHDRAW) {
            adapter.withdraw(action.asset, amount, user);
        } else if (action.action == ActionType.REBALANCE) {
            revert InvalidAction();
        }
    }

    // ─── View ─────────────────────────────────────────────────────────────────
    function getPortfolio(
        address user,
        address[] calldata assets,
        address[] calldata adapters
    ) external view returns (uint256[] memory balances, uint256[] memory apys) {
        uint256 len = assets.length;
        balances = new uint256[](len);
        apys = new uint256[](len);
        for (uint256 i = 0; i < len; ) {
            balances[i] = ILendingAdapter(adapters[i]).getBalance(assets[i], user);
            apys[i] = ILendingAdapter(adapters[i]).getAPY(assets[i]);
            unchecked { ++i; }
        }
    }
}
