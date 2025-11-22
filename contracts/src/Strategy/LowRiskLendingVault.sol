// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20, IERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "openzeppelin-contracts/token/ERC20/extensions/ERC4626.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";

contract LowRiskLendingVault is ERC4626, Ownable {
    uint64 public cooldown; // en segundos

    struct PositionInfo {
        uint64 lastDepositTimestamp;
    }

    mapping(address => PositionInfo) public positions;

    constructor(IERC20 usdc, address owner_)
        ERC20("Wolf Low Risk Arc", "wLOW-ARC")
        ERC4626(usdc)
        Ownable(owner_)
    {
        cooldown = 1 days; // low risk: 1 día de cooldown
    }

    /* ============ Hooks de depósito/retiro ============ */

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        super._deposit(caller, receiver, assets, shares);

        positions[receiver].lastDepositTimestamp = uint64(block.timestamp);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner_,
        uint256 assets,
        uint256 shares
    ) internal override {
        PositionInfo memory p = positions[owner_];

        require(
            block.timestamp >= p.lastDepositTimestamp + cooldown,
            "cooldown not finished"
        );

        super._withdraw(caller, receiver, owner_, assets, shares);
    }

    /* ============ Función de "lending yield" simple ============ */

    /// @notice Inyecta yield al vault (USDC extra) desde el owner/keeper.
    /// Para la demo, el owner aprueba y llama a esto con fondos de faucet.
    function accrueYield(uint256 amount) external onlyOwner {
        // Transfiere USDC desde el owner al vault
        asset().transferFrom(msg.sender, address(this), amount);
        // No hace falta más lógica: como ERC4626 usa balanceOf(vault) como totalAssets(),
        // al entrar más USDC, el precio por share sube automáticamente.
    }
}