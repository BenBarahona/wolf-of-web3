// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {WolfBaseStakingVault} from "../src/strategy/WolfBaseStakingVault.sol";

/// @notice Forge script to deploy the WolfBaseStakingVault on Celo Testnet.
/// @dev For the MVP, lpToken = USDC and rewardToken = USDC on Celo.
contract DeployCeloStakingVault is Script {
    // TODO: replace this with the actual USDC token address on the Celo testnet you choose
    // e.g. Celo Alfajores or Celo Sepolia
    address constant USDC_CELO = 0x01C5C0122039549AD1493B8220cABEdD739BC44E;

    function run() external {
        // Load deployer private key from env: PRIVATE_KEY
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);

        IERC20 usdc = IERC20(USDC_CELO);

        // For the MVP: users stake USDC and earn rewards in USDC as well
        WolfBaseStakingVault stakingVault = new WolfBaseStakingVault(
            usdc,      // lpToken  = USDC on Celo
            usdc,      // rewardToken = USDC (or switch later to another token)
            deployer   // owner_ (admin)
        );

        console2.log("Deployer (owner):", deployer);
        console2.log("Celo staking vault deployed at:", address(stakingVault));

        vm.stopBroadcast();
    }
}