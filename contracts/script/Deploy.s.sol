// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {WolfBaseLendingVault} from "../src/strategy/WolfBaseLendingVault.sol";

/// @notice Forge script to deploy a Low-Risk WolfBaseLendingVault on Arc Testnet.
contract DeployLowRiskVault is Script {
    // USDC native token on Arc Testnet
    address constant USDC_ARC = 0x3600000000000000000000000000000000000000;

    function run() external {
        // Load deployer private key from env: PRIVATE_KEY
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);

        IERC20 usdc = IERC20(USDC_ARC);

        // name, symbol, owner, cooldown = 0 (no cooldown for low risk)
        WolfBaseLendingVault vault = new WolfBaseLendingVault(
            usdc,
            "Wolf Low Risk Arc",   // name_
            "wLOW-ARC",            // symbol_
            deployer,              // owner_
            0                      // cooldown_ (no cooldown)
        );

        console2.log("Deployer (owner):", deployer);
        console2.log("LowRisk vault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}