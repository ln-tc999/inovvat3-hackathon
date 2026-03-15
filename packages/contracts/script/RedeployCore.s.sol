// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {YieldOptimizerCore} from "../src/YieldOptimizerCore.sol";

/// @notice Redeploy only YieldOptimizerCore (with executeManual) and re-register adapters
contract RedeployCore is Script {
    // Existing deployed addresses (Base Sepolia)
    address constant AGENT_POLICY       = 0xA6ba2CF98B043eA522650535B56Be9bE46371f88;
    address constant AAVE_ADAPTER       = 0x4071DdCe831E484640e864a8627cc3ece308e895;
    address constant MORPHO_ADAPTER     = 0xf9B035426d2A16EF00F0547dc0F4Ed9226D2671d;
    address constant CL_AUTOMATION_REG  = 0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2;
    address constant AUTO_YIELD_CONSUMER = 0xd3029585c3934323743EE7740e67dCDe99DF9802;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address backendWallet = vm.envOr("BACKEND_WALLET", address(0));

        vm.startBroadcast(deployerKey);

        // Deploy new YieldOptimizerCore with executeManual support
        YieldOptimizerCore core = new YieldOptimizerCore(
            AGENT_POLICY,
            CL_AUTOMATION_REG,
            AUTO_YIELD_CONSUMER
        );
        console.log("New YieldOptimizerCore:", address(core));

        // Re-register both adapters
        core.registerAdapter(AAVE_ADAPTER, true);
        core.registerAdapter(MORPHO_ADAPTER, true);
        console.log("Adapters registered");

        // Transfer ownership to backend wallet if provided
        if (backendWallet != address(0)) {
            core.transferOwnership(backendWallet);
            console.log("Ownership transferred to:", backendWallet);
        }

        vm.stopBroadcast();

        console.log("---");
        console.log("Update these env vars:");
        console.log("PUBLIC_YIELD_OPTIMIZER_ADDRESS=", address(core));
    }
}
