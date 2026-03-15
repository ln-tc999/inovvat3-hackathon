// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {AgentPolicy} from "../src/AgentPolicy.sol";
import {YieldOptimizerCore} from "../src/YieldOptimizerCore.sol";
import {SafeAgentModule} from "../src/SafeAgentModule.sol";
import {AaveV3Adapter} from "../src/adapters/AaveV3Adapter.sol";
import {MorphoAdapter} from "../src/adapters/MorphoAdapter.sol";
import {AutoYieldConsumer} from "../src/AutoYieldConsumer.sol";
import {IMorpho} from "../src/adapters/MorphoAdapter.sol";

contract Deploy is Script {
    // Base Sepolia addresses
    address constant AAVE_POOL_SEPOLIA    = 0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27;
    address constant MORPHO_SEPOLIA       = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    address constant CL_FUNCTIONS_ROUTER  = 0xf9B8fc078197181C841c296C876945aaa425B278;
    address constant CL_AUTOMATION_REG    = 0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2;

    // Tokens on Base Sepolia
    address constant USDC = 0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f;
    address constant WETH = 0x4200000000000000000000000000000000000006; // Base Sepolia WETH

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        bytes32 donId = vm.envBytes32("CHAINLINK_DON_ID");
        uint64 subId = uint64(vm.envUint("CHAINLINK_SUBSCRIPTION_ID"));
        // Optional: backend wallet that can call executeManual
        address backendWallet = vm.envOr("BACKEND_WALLET", address(0));

        vm.startBroadcast(deployerKey);

        // 1. Deploy AgentPolicy
        AgentPolicy agentPolicy = new AgentPolicy();
        console.log("AgentPolicy:", address(agentPolicy));

        // 2. Deploy AutoYieldConsumer placeholder first to get its address
        //    Then pass it to YieldOptimizerCore constructor
        // We deploy core with address(0) consumer first, then update via setConsumer
        YieldOptimizerCore core = new YieldOptimizerCore(
            address(agentPolicy),
            CL_AUTOMATION_REG,
            address(0) // updated below after consumer deploy
        );
        console.log("YieldOptimizerCore:", address(core));

        // 3. Deploy SafeAgentModule
        SafeAgentModule safeModule = new SafeAgentModule(address(agentPolicy), address(core));
        console.log("SafeAgentModule:", address(safeModule));

        // 4. Deploy Adapters — USDC market
        AaveV3Adapter aaveAdapter = new AaveV3Adapter(AAVE_POOL_SEPOLIA, address(core));
        console.log("AaveV3Adapter:", address(aaveAdapter));

        IMorpho.MarketParams memory morphoMarket = IMorpho.MarketParams({
            loanToken: USDC,
            collateralToken: address(0),
            oracle: address(0),
            irm: address(0),
            lltv: 0
        });
        MorphoAdapter morphoAdapter = new MorphoAdapter(MORPHO_SEPOLIA, address(core), morphoMarket);
        console.log("MorphoAdapter:", address(morphoAdapter));

        // 5. Register adapters in core
        core.registerAdapter(address(aaveAdapter), true);
        core.registerAdapter(address(morphoAdapter), true);

        // 6. Deploy AutoYieldConsumer
        string memory jsSource = ""; // set via setJsSource after deploy
        AutoYieldConsumer consumer = new AutoYieldConsumer(
            CL_FUNCTIONS_ROUTER,
            address(core),
            address(agentPolicy),
            donId,
            subId,
            jsSource
        );
        console.log("AutoYieldConsumer:", address(consumer));

        // 7. If backend wallet provided, transfer ownership to it
        //    so backend can call executeManual()
        if (backendWallet != address(0)) {
            core.transferOwnership(backendWallet);
            console.log("Ownership transferred to backend wallet:", backendWallet);
        }

        vm.stopBroadcast();

        console.log("---");
        console.log("USDC:", USDC);
        console.log("WETH:", WETH);
    }
}
