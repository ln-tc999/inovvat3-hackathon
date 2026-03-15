// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {AaveV3Adapter} from "../src/adapters/AaveV3Adapter.sol";
import {YieldOptimizerCore} from "../src/YieldOptimizerCore.sol";

/// @notice Redeploy AaveV3Adapter with correct pool address and re-register in core
contract RedeployAaveAdapter is Script {
    // Correct Aave V3 Pool on Base Sepolia
    address constant AAVE_POOL_SEPOLIA   = 0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27;

    // Existing deployed addresses
    address constant YIELD_OPTIMIZER     = 0x68026bd66e2310cfb674dF5d171e7811A3A4a5bE;
    address constant OLD_AAVE_ADAPTER    = 0x4071DdCe831E484640e864a8627cc3ece308e895;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        // Deploy new AaveV3Adapter with correct pool
        AaveV3Adapter newAdapter = new AaveV3Adapter(AAVE_POOL_SEPOLIA, YIELD_OPTIMIZER);
        console.log("New AaveV3Adapter:", address(newAdapter));

        // Deregister old adapter, register new one
        YieldOptimizerCore core = YieldOptimizerCore(YIELD_OPTIMIZER);
        core.registerAdapter(OLD_AAVE_ADAPTER, false);
        core.registerAdapter(address(newAdapter), true);
        console.log("Old adapter deregistered, new adapter registered");

        vm.stopBroadcast();

        console.log("---");
        console.log("Update AAVE_ADAPTER_ADDRESS to:", address(newAdapter));
    }
}
