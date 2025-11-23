"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useCircle, useWallets, useWalletBalance } from "@/lib/circle";
import {
  CONTRACT_ADDRESSES,
  getAllVaultConfigs,
  type VaultConfig,
} from "@/lib/contracts";
import { createPublicClient, http } from "viem";
import { WOLF_BASE_LENDING_VAULT_ABI } from "@/lib/contracts/wolfBaseLendingVault";

interface Asset {
  name: string;
  symbol: string;
  percentage: number;
  change: string;
  blockchain?: string;
  amount: number;
  type: "wallet" | "vault";
}

interface Activity {
  id: string;
  completed: boolean;
  title: string;
  description: string;
}

export default function Holdings() {
  const router = useRouter();
  const { userSession, isInitialized } = useCircle();
  const { getWallets } = useWallets();
  const { getBalance } = useWalletBalance();
  const [wallets, setWallets] = useState<any[]>([]);
  const [balances, setBalances] = useState<{ [walletId: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  // Vault data for all chains - keyed by blockchain name
  const [vaultPositions, setVaultPositions] = useState<{
    [blockchain: string]: {
      userAssets: string;
      userShares: string;
      vaultName: string;
    };
  }>({});

  // Mock activities - in a real app, fetch from backend
  const [activities] = useState<Activity[]>([
    {
      id: "1",
      completed: true,
      title: "Deposited USDC to Arc",
      description: "Successfully bridged to Arc Testnet",
    },
    {
      id: "2",
      completed: true,
      title: "Rebalanced portfolio",
      description: "Adjusted for market conditions",
    },
    {
      id: "3",
      completed: true,
      title: "Staked on World Chain",
      description: "Earning yield",
    },
    {
      id: "4",
      completed: false,
      title: "Monitor market trends",
      description: "Awaiting further analysis",
    },
  ]);

  useEffect(() => {
    async function loadData() {
      if (!userSession) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);

        // Get wallets from Circle
        const userWallets = await getWallets();
        console.log("Loaded wallets:", userWallets);
        setWallets(userWallets || []);

        // Get balances for each wallet
        const balancePromises = (userWallets || []).map(async (wallet: any) => {
          try {
            const walletBalances = await getBalance(wallet.id);
            return { walletId: wallet.id, balances: walletBalances };
          } catch (err) {
            console.error(
              `Failed to load balance for wallet ${wallet.id}:`,
              err
            );
            return { walletId: wallet.id, balances: [] };
          }
        });

        const balanceResults = await Promise.all(balancePromises);
        const balanceMap: { [walletId: string]: any[] } = {};
        balanceResults.forEach((result) => {
          balanceMap[result.walletId] = result.balances;
        });

        console.log("Loaded balances:", balanceMap);
        setBalances(balanceMap);

        // Load vault positions for all chains
        await loadAllVaultPositions(userWallets);
      } catch (error) {
        console.error("Error loading wallet data:", error);
      } finally {
        setLoading(false);
      }
    }

    // Load vault data from all configured vaults
    async function loadAllVaultPositions(userWallets: any[]) {
      const allVaults = getAllVaultConfigs();
      const vaultPositionsMap: typeof vaultPositions = {};

      for (const vaultConfig of allVaults) {
        try {
          // Find wallet for this blockchain
          const wallet = userWallets.find(
            (w: any) => w.blockchain === vaultConfig.blockchain
          );

          if (!wallet) {
            console.log(`No wallet found for ${vaultConfig.blockchain}`);
            continue;
          }

          // Read vault data directly using viem
          const position = await readVaultPosition(
            vaultConfig.address,
            wallet.address,
            vaultConfig.chainId
          );

          if (position && parseFloat(position.userAssets) > 0) {
            vaultPositionsMap[vaultConfig.blockchain] = {
              userAssets: position.userAssets,
              userShares: position.userShares,
              vaultName: vaultConfig.name,
            };
          }
        } catch (err) {
          console.error(`Failed to load vault for ${vaultConfig.name}:`, err);
        }
      }

      console.log("Loaded vault positions:", vaultPositionsMap);
      setVaultPositions(vaultPositionsMap);
    }

    if (isInitialized) {
      loadData();
    }
  }, [isInitialized, userSession, getWallets, getBalance, router]);

  // Helper function to read vault position directly
  async function readVaultPosition(
    vaultAddress: `0x${string}`,
    userAddress: string,
    chainId: number
  ) {
    try {
      // Get RPC URL for the chain
      const rpcUrls: Record<number, string> = {
        5042002: "https://rpc.testnet.arc.network", // Arc
        4801: "https://worldchain-sepolia.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g", // World
        84532: "https://sepolia.base.org", // Base
        44787: "https://alfajores-forno.celo-testnet.org", // Celo Alfajores
      };

      const rpcUrl = rpcUrls[chainId];
      if (!rpcUrl) {
        console.warn(`No RPC URL for chain ${chainId}`);
        return null;
      }

      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      // Read userAssets
      const userAssets = await client.readContract({
        address: vaultAddress,
        abi: WOLF_BASE_LENDING_VAULT_ABI,
        functionName: "previewRedeem",
        args: [await getUserShares(client, vaultAddress, userAddress)],
      });

      const userShares = await getUserShares(client, vaultAddress, userAddress);

      return {
        userAssets: (Number(userAssets) / 1e6).toFixed(2),
        userShares: (Number(userShares) / 1e6).toFixed(2),
      };
    } catch (error) {
      console.error(`Error reading vault position:`, error);
      return null;
    }
  }

  async function getUserShares(
    client: any,
    vaultAddress: `0x${string}`,
    userAddress: string
  ) {
    return await client.readContract({
      address: vaultAddress,
      abi: WOLF_BASE_LENDING_VAULT_ABI,
      functionName: "balanceOf",
      args: [userAddress as `0x${string}`],
    });
  }

  // Calculate assets from both wallet balances AND vault positions
  const getAssets = (): Asset[] => {
    const assets: Asset[] = [];
    let totalValue = 0;

    // 1. Group wallet balances by blockchain
    const balancesByChain = new Map<string, number>();

    wallets.forEach((wallet: any) => {
      const walletBalances = balances[wallet.id] || [];
      walletBalances.forEach((balance: any) => {
        if (balance.token?.symbol === "USDC") {
          const amount = parseFloat(balance.amount || "0");
          const blockchain = wallet.blockchain;
          balancesByChain.set(
            blockchain,
            (balancesByChain.get(blockchain) || 0) + amount
          );
          totalValue += amount;
        }
      });
    });

    // 2. Add vault positions from all chains
    Object.entries(vaultPositions).forEach(([blockchain, position]) => {
      const vaultAmount = parseFloat(position.userAssets);
      if (vaultAmount > 0) {
        totalValue += vaultAmount;

        const chainName = blockchain
          .replace("ARC-TESTNET", "Arc")
          .replace("WORLD-TESTNET", "World")
          .replace("BASE-TESTNET", "Base")
          .replace("CELO-TESTNET", "Celo");

        assets.push({
          name: `${chainName} Vault`,
          symbol: "USDC",
          amount: vaultAmount,
          percentage: 0, // Will calculate after totalValue is complete
          change: "+0.0%",
          blockchain,
          type: "vault",
        });
      }
    });

    // 3. Convert wallet balances to assets array
    balancesByChain.forEach((amount, blockchain) => {
      if (amount > 0) {
        const chainName = blockchain
          .replace("ARC-TESTNET", "Arc")
          .replace("WORLD-TESTNET", "World")
          .replace("BASE-TESTNET", "Base");

        assets.push({
          name: chainName,
          symbol: "USDC",
          amount,
          percentage: 0, // Will calculate next
          change: "+0.0%",
          blockchain,
          type: "wallet",
        });
      }
    });

    // 4. Calculate percentages now that we have totalValue
    assets.forEach((asset) => {
      asset.percentage =
        totalValue > 0 ? Math.round((asset.amount / totalValue) * 100) : 0;
    });

    return assets;
  };

  const assets = getAssets();
  const totalValue = assets.reduce((sum, asset) => sum + asset.amount, 0);

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your holdings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Your Assets</h1>
            <p className="text-sm text-gray-500 mt-1">
              Current Strategy: Balanced Strategy
            </p>
          </div>
          <button
            onClick={() => router.push("/settings")}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Assets Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start by depositing USDC to one of our supported chains
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            {/* Asset Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {assets.map((asset, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {asset.name} {asset.symbol}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ${asset.amount.toFixed(2)} • {asset.percentage}%
                    </p>
                  </div>

                  {/* Simple Chart Visualization */}
                  <div className="h-16 mb-3 relative">
                    <svg
                      viewBox="0 0 100 40"
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      <path
                        d={`M 0,${20 + Math.sin(index) * 5} Q 20,${15 + Math.sin(index + 1) * 5} 40,${18 + Math.sin(index + 2) * 5} T 80,${16 + Math.sin(index + 3) * 5} 100,${14 + Math.sin(index + 4) * 5}`}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                        className="transition-all"
                      />
                    </svg>
                  </div>

                  <p className="text-sm font-semibold text-green-600">
                    {asset.change}
                  </p>
                </div>
              ))}

              {/* Add more asset slots if less than 4 */}
              {assets.length < 4 &&
                Array.from({ length: 4 - assets.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200 flex items-center justify-center"
                  >
                    <p className="text-sm text-gray-400">Add Asset</p>
                  </div>
                ))}
            </div>

            {/* Activities / Recent Actions */}
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center ${
                        activity.completed
                          ? "bg-gray-900 text-white"
                          : "border-2 border-gray-300"
                      }`}
                    >
                      {activity.completed && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        activity.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
