// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {AgentPolicy} from "../src/AgentPolicy.sol";
import {YieldOptimizerCore} from "../src/YieldOptimizerCore.sol";
import {ILendingAdapter} from "../src/interfaces/ILendingAdapter.sol";

/// @notice Mock adapter for testing
contract MockAdapter is ILendingAdapter {
    mapping(address => mapping(address => uint256)) public balances;
    uint256 public mockAPY = 500; // 5% in bps

    function supply(address asset, uint256 amount, address onBehalfOf) external {
        balances[onBehalfOf][asset] += amount;
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        balances[to][asset] -= amount;
        return amount;
    }

    function getAPY(address) external view returns (uint256) { return mockAPY; }
    function getBalance(address asset, address user) external view returns (uint256) {
        return balances[user][asset];
    }
}

contract YieldOptimizerTest is Test {
    AgentPolicy policy;
    YieldOptimizerCore core;
    MockAdapter adapter;

    address user = address(0xBEEF);
    address asset = address(0xA55E7);
    address automation = address(0xAA);
    address consumer = address(0xBB);

    function setUp() public {
        policy = new AgentPolicy();
        core = new YieldOptimizerCore(address(policy), automation, consumer);
        adapter = new MockAdapter();

        core.registerAdapter(address(adapter), true);

        // Setup user policy
        address[] memory allowlist = new address[](1);
        allowlist[0] = address(adapter);

        vm.prank(user);
        policy.setPolicy(
            5,                    // maxRisk
            1_000_000e18,         // dailyLimit
            30 days,              // sessionDuration
            keccak256("maximize yield"),
            allowlist
        );
    }

    function test_ExecuteSupply() public {
        YieldOptimizerCore.YieldAction[] memory actions = new YieldOptimizerCore.YieldAction[](1);
        actions[0] = YieldOptimizerCore.YieldAction({
            protocol: address(adapter),
            action: YieldOptimizerCore.ActionType.SUPPLY,
            asset: asset,
            amount: 1000e18
        });

        vm.prank(automation);
        core.executeBatch(user, actions);

        assertEq(adapter.getBalance(asset, user), 1000e18);
    }

    function test_ExecuteWithdraw() public {
        // First supply
        test_ExecuteSupply();

        YieldOptimizerCore.YieldAction[] memory actions = new YieldOptimizerCore.YieldAction[](1);
        actions[0] = YieldOptimizerCore.YieldAction({
            protocol: address(adapter),
            action: YieldOptimizerCore.ActionType.WITHDRAW,
            asset: asset,
            amount: 500e18
        });

        vm.prank(automation);
        core.executeBatch(user, actions);

        assertEq(adapter.getBalance(asset, user), 500e18);
    }

    function test_PolicyKillSwitch() public {
        vm.prank(user);
        policy.pauseAgent();

        YieldOptimizerCore.YieldAction[] memory actions = new YieldOptimizerCore.YieldAction[](1);
        actions[0] = YieldOptimizerCore.YieldAction({
            protocol: address(adapter),
            action: YieldOptimizerCore.ActionType.SUPPLY,
            asset: asset,
            amount: 100e18
        });

        vm.prank(automation);
        vm.expectRevert(AgentPolicy.PolicyNotActive.selector);
        core.executeBatch(user, actions);
    }

    function test_DailyLimitEnforced() public {
        address[] memory allowlist = new address[](1);
        allowlist[0] = address(adapter);

        vm.prank(user);
        policy.setPolicy(5, 100e18, 30 days, keccak256("test"), allowlist);

        YieldOptimizerCore.YieldAction[] memory actions = new YieldOptimizerCore.YieldAction[](1);
        actions[0] = YieldOptimizerCore.YieldAction({
            protocol: address(adapter),
            action: YieldOptimizerCore.ActionType.SUPPLY,
            asset: asset,
            amount: 200e18 // exceeds 100e18 limit
        });

        vm.prank(automation);
        vm.expectRevert(AgentPolicy.DailyLimitExceeded.selector);
        core.executeBatch(user, actions);
    }

    function test_UnregisteredAdapterReverts() public {
        address fakeAdapter = address(0xDEAD);

        YieldOptimizerCore.YieldAction[] memory actions = new YieldOptimizerCore.YieldAction[](1);
        actions[0] = YieldOptimizerCore.YieldAction({
            protocol: fakeAdapter,
            action: YieldOptimizerCore.ActionType.SUPPLY,
            asset: asset,
            amount: 100e18
        });

        vm.prank(automation);
        vm.expectRevert(YieldOptimizerCore.AdapterNotRegistered.selector);
        core.executeBatch(user, actions);
    }

    function test_GetPortfolio() public {
        test_ExecuteSupply();

        address[] memory assets = new address[](1);
        address[] memory adapters = new address[](1);
        assets[0] = asset;
        adapters[0] = address(adapter);

        (uint256[] memory balances, uint256[] memory apys) = core.getPortfolio(user, assets, adapters);
        assertEq(balances[0], 1000e18);
        assertEq(apys[0], 500);
    }
}
