// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {WolfBaseIndexVault} from "../src/strategy/WolfBaseIndexVault.sol";

/// @notice Forge script to deploy a High-Risk Meme Index Vault on World Chain.
contract DeployHighRiskMemeIndexVaultWorld is Script {
    // USDC on World Chain mainnet
    // https://docs.world.org/world-chain/reference/useful-contracts
    address constant USDC_WORLD = 0x79A02482A880bCE3F13e09Da970dC34db4CD24d1;

    function run() external {
        // Load deployer private key from env: PRIVATE_KEY
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);

        IERC20 usdc = IERC20(USDC_WORLD);

        // High-risk meme index: long cooldown (ej. 14 días)
        WolfBaseIndexVault vault = new WolfBaseIndexVault(
            usdc,
            "Wolf High Risk Meme Index World", // name_
            "wMEME-WORLD",                    // symbol_
            deployer,                         // owner_
            14 days                           // cooldown_
        );

        console2.log("Deployer (owner):", deployer);
        console2.log("HighRiskMemeIndexVault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}