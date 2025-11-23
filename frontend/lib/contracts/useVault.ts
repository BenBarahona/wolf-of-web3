import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { 
  WOLF_BASE_LENDING_VAULT_ABI, 
  CONTRACT_ADDRESSES,
  ARC_CHAIN_ID 
} from './wolfBaseLendingVault';

/**
 * Hook to read vault data (total assets, user balance, etc.)
 */
export function useVaultRead(vaultAddress: `0x${string}`) {
  const { address: userAddress } = useAccount();

  // Total assets in the vault
  const { data: totalAssets } = useReadContract({
    address: vaultAddress,
    abi: WOLF_BASE_LENDING_VAULT_ABI,
    functionName: 'totalAssets',
    chainId: ARC_CHAIN_ID,
  });

  // User's share balance
  const { data: userShares } = useReadContract({
    address: vaultAddress,
    abi: WOLF_BASE_LENDING_VAULT_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId: ARC_CHAIN_ID,
  });

  // Convert shares to assets
  const { data: userAssets } = useReadContract({
    address: vaultAddress,
    abi: WOLF_BASE_LENDING_VAULT_ABI,
    functionName: 'convertToAssets',
    args: userShares ? [userShares] : undefined,
    chainId: ARC_CHAIN_ID,
  });

  // Cooldown period
  const { data: cooldown } = useReadContract({
    address: vaultAddress,
    abi: WOLF_BASE_LENDING_VAULT_ABI,
    functionName: 'cooldown',
    chainId: ARC_CHAIN_ID,
  });

  // TVL cap
  const { data: maxTotalAssets } = useReadContract({
    address: vaultAddress,
    abi: WOLF_BASE_LENDING_VAULT_ABI,
    functionName: 'maxTotalAssets',
    chainId: ARC_CHAIN_ID,
  });

  // User's position info
  const { data: position } = useReadContract({
    address: vaultAddress,
    abi: WOLF_BASE_LENDING_VAULT_ABI,
    functionName: 'positions',
    args: userAddress ? [userAddress] : undefined,
    chainId: ARC_CHAIN_ID,
  });

  return {
    totalAssets: totalAssets ? formatUnits(totalAssets, 6) : '0', // USDC has 6 decimals
    userShares: userShares ? formatUnits(userShares, 18) : '0',
    userAssets: userAssets ? formatUnits(userAssets, 6) : '0',
    cooldown: cooldown ? Number(cooldown) : 0,
    maxTotalAssets: maxTotalAssets ? formatUnits(maxTotalAssets, 6) : '0',
    lastDepositTimestamp: position ? Number(position) : 0,
  };
}

/**
 * Hook to write to vault (deposit, withdraw, etc.)
 */
export function useVaultWrite(vaultAddress: `0x${string}`) {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const deposit = async (amount: string, receiver: `0x${string}`) => {
    const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals
    
    writeContract({
      address: vaultAddress,
      abi: WOLF_BASE_LENDING_VAULT_ABI,
      functionName: 'deposit',
      args: [amountInWei, receiver],
      chainId: ARC_CHAIN_ID,
    });
  };

  const withdraw = async (amount: string, receiver: `0x${string}`, owner: `0x${string}`) => {
    const amountInWei = parseUnits(amount, 6);
    
    writeContract({
      address: vaultAddress,
      abi: WOLF_BASE_LENDING_VAULT_ABI,
      functionName: 'withdraw',
      args: [amountInWei, receiver, owner],
      chainId: ARC_CHAIN_ID,
    });
  };

  const redeem = async (shares: string, receiver: `0x${string}`, owner: `0x${string}`) => {
    const sharesInWei = parseUnits(shares, 18);
    
    writeContract({
      address: vaultAddress,
      abi: WOLF_BASE_LENDING_VAULT_ABI,
      functionName: 'redeem',
      args: [sharesInWei, receiver, owner],
      chainId: ARC_CHAIN_ID,
    });
  };

  return {
    deposit,
    withdraw,
    redeem,
    isPending,
    isSuccess,
    error,
  };
}

/**
 * Hook to get preview amounts (useful for UI display)
 */
export function useVaultPreview(vaultAddress: `0x${string}`) {
  const previewDeposit = (assets: string) => {
    const amountInWei = parseUnits(assets, 6);
    
    return useReadContract({
      address: vaultAddress,
      abi: WOLF_BASE_LENDING_VAULT_ABI,
      functionName: 'previewDeposit',
      args: [amountInWei],
      chainId: ARC_CHAIN_ID,
    });
  };

  const previewWithdraw = (assets: string) => {
    const amountInWei = parseUnits(assets, 6);
    
    return useReadContract({
      address: vaultAddress,
      abi: WOLF_BASE_LENDING_VAULT_ABI,
      functionName: 'previewWithdraw',
      args: [amountInWei],
      chainId: ARC_CHAIN_ID,
    });
  };

  return {
    previewDeposit,
    previewWithdraw,
  };
}

