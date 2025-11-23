// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title Wolf Base Staking Vault (Celo)
/// @notice Minimal staking contract where users stake an ERC20 token (e.g. USDC on Celo)
///         and earn rewards in another ERC20 (can also be USDC).
/// @dev For the hackathon, you can set both lpToken = USDC and rewardToken = USDC on Celo.
contract WolfBaseStakingVault is Ownable {
    /// @notice Token that users stake (in your case: USDC on Celo).
    IERC20 public immutable lpToken;

    /// @notice Token used to pay rewards (USDC or any other ERC20).
    IERC20 public immutable rewardToken;

    /// @notice Reward emission rate (reward tokens per second).
    uint256 public rewardRate;

    /// @notice Last timestamp when global reward state was updated.
    uint256 public lastUpdateTime;

    /// @notice Accumulated reward per 1 staked token, scaled by 1e18.
    uint256 public rewardPerTokenStored;

    /// @notice Total amount of lpToken staked in this contract.
    uint256 public totalSupply;

    /// @notice Amount of lpToken staked per user.
    mapping(address => uint256) public balances;

    /// @notice Tracks how much rewardPerToken was already accounted for each user.
    mapping(address => uint256) public userRewardPerTokenPaid;

    /// @notice Accumulated but not yet claimed rewards per user.
    mapping(address => uint256) public rewards;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardParamsUpdated(uint256 rewardRate, uint256 lastUpdateTime);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @param _lpToken     Token users will stake (for you: USDC on Celo).
    /// @param _rewardToken Token paid as rewards (USDC or another ERC20).
    /// @param owner_       Admin/owner address (e.g. protocol or deployer).
    constructor(IERC20 _lpToken, IERC20 _rewardToken, address owner_) Ownable(owner_) {
        require(address(_lpToken) != address(0), "lpToken is zero");
        require(address(_rewardToken) != address(0), "rewardToken is zero");
        lpToken = _lpToken;
        rewardToken = _rewardToken;
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL ACCOUNTING
    //////////////////////////////////////////////////////////////*/

    /// @notice Returns the cumulative reward per 1 staked token.
    /// @dev Uses a "reward per token" model (Synthetix-style).
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }

        uint256 timeDelta = block.timestamp - lastUpdateTime;
        return rewardPerTokenStored + (timeDelta * rewardRate * 1e18) / totalSupply;
    }

    /// @notice Returns how many reward tokens a user has earned so far.
    function earned(address account) public view returns (uint256) {
        uint256 rpt = rewardPerToken();
        uint256 paid = userRewardPerTokenPaid[account];
        return ((balances[account] * (rpt - paid)) / 1e18) + rewards[account];
    }

    /// @dev Updates global reward state and, if account != 0, syncs user rewards.
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }

        _;
    }

    /*//////////////////////////////////////////////////////////////
                         OWNER: FUND REWARDS
    //////////////////////////////////////////////////////////////*/

    /// @notice Owner funds new rewards and sets the distribution duration.
    /// @dev For the MVP, your AI agent / protocol wallet calls this after
    ///      generating yield off-chain or in another strategy.
    /// @param rewardAmount Amount of reward tokens to distribute.
    /// @param duration     Duration in seconds over which rewards are streamed.
    function notifyRewardAmount(uint256 rewardAmount, uint256 duration)
        external
        onlyOwner
        updateReward(address(0))
    {
        require(duration > 0, "duration = 0");
        require(rewardAmount > 0, "rewardAmount = 0");

        // Pull reward tokens from owner
        bool ok = rewardToken.transferFrom(msg.sender, address(this), rewardAmount);
        require(ok, "reward transfer failed");

        // Simple linear emission: rewardRate = rewardAmount / duration
        rewardRate = rewardAmount / duration;
        lastUpdateTime = block.timestamp;

        emit RewardParamsUpdated(rewardRate, lastUpdateTime);
    }

    /*//////////////////////////////////////////////////////////////
                              USER ACTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Stake lpToken (USDC in your Celo MVP) to start earning rewards.
    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "amount = 0");

        totalSupply += amount;
        balances[msg.sender] += amount;

        bool ok = lpToken.transferFrom(msg.sender, address(this), amount);
        require(ok, "stake transfer failed");

        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw previously staked lpToken.
    function withdraw(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "amount = 0");
        require(balances[msg.sender] >= amount, "insufficient staked");

        totalSupply -= amount;
        balances[msg.sender] -= amount;

        bool ok = lpToken.transfer(msg.sender, amount);
        require(ok, "withdraw transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim accumulated rewards (paid in rewardToken).
    function claimReward() public updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward == 0) return;

        rewards[msg.sender] = 0;

        bool ok = rewardToken.transfer(msg.sender, reward);
        require(ok, "reward transfer failed");

        emit RewardPaid(msg.sender, reward);
    }

    /// @notice Convenience function: withdraw full stake + claim all rewards.
    function exit() external {
        withdraw(balances[msg.sender]);
        claimReward();
    }
}