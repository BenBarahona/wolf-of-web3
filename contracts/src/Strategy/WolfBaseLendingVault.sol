// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20, IERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC4626.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title Wolf Base Lending Vault (Arc)
/// @notice ERC4626 vault over USDC on Arc with simple lending-like behavior, cooldown and TVL cap.
/// @dev Concrete strategies (Low/Medium/High) can inherit this contract and configure cooldown in the constructor.
contract WolfBaseLendingVault is ERC4626, Ownable {
    /// @notice Cooldown in seconds before a user can withdraw after their last deposit (0 = no cooldown).
    uint48 public immutable cooldown;

    /// @notice Maximum total assets (TVL cap) allowed in this vault. 0 = uncapped.
    uint256 public maxTotalAssets;

    /// @notice Per-user position metadata.
    struct PositionInfo {
        /// @notice Timestamp of the last deposit made by this user.
        uint48 lastDepositTimestamp;
    }

    /// @notice Mapping from user address to their position info.
    mapping(address => PositionInfo) public positions;

    /// @notice Emitted when the owner injects additional yield into the vault.
    event YieldAccrued(address indexed from, uint256 amount);

    /// @notice Emitted when the TVL cap is updated.
    event MaxTotalAssetsUpdated(uint256 oldCap, uint256 newCap);

    /// @notice Error thrown when a user tries to withdraw before the cooldown has elapsed.
    error CooldownNotFinished(uint256 lastDeposit, uint256 requiredTimestamp);

    /// @notice Error thrown when a deposit would exceed the configured TVL cap.
    error TvlCapExceeded(uint256 currentAssets, uint256 depositAmount, uint256 maxTotalAssets);

    /// @param usdc Address of the USDC token on Arc (ERC20 compatible).
    /// @param name_ Name of the vault share token (ERC20).
    /// @param symbol_ Symbol of the vault share token (ERC20).
    /// @param owner_ Address that will own the vault (admin / protocol).
    /// @param cooldown_ Cooldown in seconds before withdrawals are allowed after the last deposit.
    constructor(
        IERC20 usdc,
        string memory name_,
        string memory symbol_,
        address owner_,
        uint48 cooldown_
    )
        ERC20(name_, symbol_)
        ERC4626(usdc)
        Ownable(owner_)
    {
        require(address(usdc) != address(0), "USDC address is zero");
        require(owner_ != address(0), "owner address is zero");

        cooldown = cooldown_;
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN / RISK PARAMETERS
    //////////////////////////////////////////////////////////////*/

    /// @notice Sets the maximum total assets (TVL cap) for this vault.
    /// @dev Setting newMax to 0 removes the cap.
    function setMaxTotalAssets(uint256 newMax) external onlyOwner {
        uint256 old = maxTotalAssets;
        maxTotalAssets = newMax;
        emit MaxTotalAssetsUpdated(old, newMax);
    }

    /*//////////////////////////////////////////////////////////////
                    ERC4626 OVERRIDES: DEPOSIT / WITHDRAW
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc ERC4626
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        // Enforce TVL cap if configured
        uint256 cap = maxTotalAssets;
        if (cap != 0) {
            uint256 currentAssets = totalAssets();
            if (currentAssets + assets > cap) {
                revert TvlCapExceeded(currentAssets, assets, cap);
            }
        }

        super._deposit(caller, receiver, assets, shares);

        // Update the last deposit timestamp only if shares were actually minted
        if (shares > 0) {
            positions[receiver].lastDepositTimestamp = uint48(block.timestamp);
        }
    }

    /// @inheritdoc ERC4626
    function _withdraw(
        address caller,
        address receiver,
        address owner_,
        uint256 assets,
        uint256 shares
    ) internal override {
        uint48 cd = cooldown;

        // Apply cooldown constraint only if a non-zero cooldown is configured
        if (cd != 0) {
            uint48 last = positions[owner_].lastDepositTimestamp;
            uint48 required = last + cd;

            if (uint48(block.timestamp) < required) {
                revert CooldownNotFinished(last, required);
            }
        }

        super._withdraw(caller, receiver, owner_, assets, shares);
    }

    /*//////////////////////////////////////////////////////////////
                          YIELD INJECTION (DEMO)
    //////////////////////////////////////////////////////////////*/

    /// @notice Injects yield into the vault by transferring additional USDC from the owner/keeper.
    /// @dev For the hackathon demo, this can be funded from a faucet or protocol-owned address.
    ///      When more USDC enters the vault, totalAssets() increases and the price per share goes up,
    ///      effectively distributing yield to existing depositors.
    /// @param amount Amount of USDC to transfer from msg.sender to the vault.
    function accrueYield(uint256 amount) external onlyOwner {
        require(amount > 0, "amount = 0");

        IERC20 usdc = IERC20(asset()); // 👈 cast explícito

        bool ok = usdc.transferFrom(msg.sender, address(this), amount);
        require(ok, "USDC transfer failed");

        emit YieldAccrued(msg.sender, amount);
    }
}

/*//////////////////////////////////////////////////////////////
                        CONCRETE STRATEGIES
//////////////////////////////////////////////////////////////*/

/// @title Wolf Low-Risk Lending Vault (Arc)
/// @notice Simple "stable parking" vault: no cooldown, very conservative behavior.
contract LowRiskLendingVault is WolfBaseLendingVault {
    constructor(IERC20 usdc, address owner_)
        WolfBaseLendingVault(
            usdc,
            "Wolf Low Risk Arc",
            "wLOW-ARC",
            owner_,
            0 // no cooldown
        )
    {}
}