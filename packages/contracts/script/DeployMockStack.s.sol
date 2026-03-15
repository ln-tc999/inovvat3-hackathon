// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {MockAavePool} from "../src/mocks/MockAavePool.sol";
import {AaveV3Adapter} from "../src/adapters/AaveV3Adapter.sol";
import {YieldOptimizerCore} from "../src/YieldOptimizerCore.sol";

/// @notice Deploy full mock stack: MockUSDC + aUSDC + MockAavePool + new AaveV3Adapter
/// Uses existing YieldOptimizerCore at 0x778A3D...
contract DeployMockStack is Script {
    address constant YIELD_OPTIMIZER = 0x778A3D63BC0E575C4943b7D0D389b8EC4d0F26Ac;
    address constant DEPLOYER        = 0x72092971935F31734118fD869A768aE17C84dd0B;

    // Already deployed MockUSDC
    address constant MOCK_USDC = 0xB26BDd8Ef3eE37128462A0611FAE71E75d2A8Ba3;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // 1. Deploy aUSDC (aToken representation)
        MockERC20 aUsdc = new MockERC20("Aave USDC", "aUSDC", 6);
        console.log("aUSDC:", address(aUsdc));

        // 2. Deploy MockAavePool
        MockAavePool pool = new MockAavePool();
        pool.setAToken(MOCK_USDC, address(aUsdc));
        console.log("MockAavePool:", address(pool));

        // 3. Fund pool with USDC so withdrawals work
        //    Transfer 5000 USDC from deployer to pool as liquidity
        MockERC20(MOCK_USDC).transfer(address(pool), 5_000 * 1e6);
        console.log("Funded pool with 5000 USDC");

        // 4. Deploy new AaveV3Adapter pointing to MockAavePool
        AaveV3Adapter adapter = new AaveV3Adapter(address(pool), YIELD_OPTIMIZER);
        console.log("MockAaveV3Adapter:", address(adapter));

        // 5. Register new adapter in core (deregister old one)
        YieldOptimizerCore core = YieldOptimizerCore(YIELD_OPTIMIZER);
        core.registerAdapter(0x2Cf391a4074927a6D3b5B81af3D3D993D00DF515, false); // old
        core.registerAdapter(address(adapter), true);
        console.log("Adapter registered in core");

        // 6. aUSDC needs to allow pool to mint — pool calls mint on aUSDC
        //    MockAavePool.supply() calls aUsdc.mint(), so aUsdc must allow pool
        //    Since MockERC20.mint() is public (no access control), this works already

        vm.stopBroadcast();

        console.log("---");
        console.log("MOCK_USDC:         ", MOCK_USDC);
        console.log("MOCK_AUSDC:        ", address(aUsdc));
        console.log("MOCK_AAVE_POOL:    ", address(pool));
        console.log("MOCK_AAVE_ADAPTER: ", address(adapter));
        console.log("Update AAVE_ADAPTER_ADDRESS in backend/.env and frontend/.env");
    }
}
