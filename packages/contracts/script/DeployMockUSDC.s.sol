// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract DeployMockUSDC is Script {
    address constant DEPLOYER = 0x72092971935F31734118fD869A768aE17C84dd0B;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6);
        console.log("MockUSDC:", address(usdc));

        // Mint 10,000 USDC to deployer for testing
        usdc.mint(DEPLOYER, 10_000 * 1e6);
        console.log("Minted 10,000 USDC to deployer");

        vm.stopBroadcast();
    }
}
