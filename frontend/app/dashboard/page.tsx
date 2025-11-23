"use client";

import { useEffect, useState, useMemo } from "react";
import { useCircle, useWallets, useWalletBalance } from "@/lib/circle";
import { useActivities, Activity } from "@/lib/circle/useActivities";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { VaultActionModal } from "@/components/VaultActionModal";
import {
  CONTRACT_ADDRESSES,
  useCircleVaultRead,
  useUSDCRead,
} from "@/lib/contracts";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimePeriod = "1D" | "1W" | "1M" | "3M" | "1Y" | "All";

interface TokenBalance {
  symbol: string;
  amount: string;
  percentage: number;
  change: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { userSession, isInitialized, clearSession } = useCircle();
  const { getWallets } = useWallets();
  const { getBalance } = useWalletBalance();
  const { getActivities } = useActivities();

  const [wallets, setWallets] = useState<any[]>([]);
  const [balances, setBalances] = useState<{ [walletId: string]: any[] }>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1W");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Vault and USDC data
  const [vaultData, setVaultData] = useState({
    userAssets: "0",
    userShares: "0",
  });
  const [usdcBalance, setUsdcBalance] = useState("0");

  const vaultAddress = CONTRACT_ADDRESSES.arc
    .lowRiskLendingVault as `0x${string}`;
  const { getVaultData: fetchVaultData } = useCircleVaultRead(
    vaultAddress,
    walletAddress as `0x${string}`
  );
  const { getBalance: getUSDCBalance } = useUSDCRead(
    walletAddress as `0x${string}`
  );

  // Calculate portfolio value and token allocations
  const portfolioData = useMemo(() => {
    const tokenMap = new Map<string, number>();
    let totalValue = 0;

    Object.values(balances).forEach((walletBalances) => {
      walletBalances.forEach((balance: any) => {
        const symbol = balance.token?.symbol || "Unknown";
        const amount = parseFloat(balance.amount || "0");
        tokenMap.set(symbol, (tokenMap.get(symbol) || 0) + amount);
        totalValue += amount;
      });
    });

    const tokens: TokenBalance[] = Array.from(tokenMap.entries()).map(
      ([symbol, amount]) => ({
        symbol,
        amount: amount.toFixed(2),
        percentage: totalValue > 0 ? (amount / totalValue) * 100 : 0,
        change: Math.random() * 30 - 5, // Mock data for now
      })
    );

    return {
      totalValue,
      tokens,
      change: 8.45, // Mock data for now
    };
  }, [balances]);

  const chartData = useMemo(() => {
    const periods = {
      "1D": 24,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "1Y": 365,
      All: 730,
    };

    const points = periods[selectedPeriod];
    const baseValue = portfolioData.totalValue;
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 0; i < Math.min(points, 30); i++) {
      labels.push("");
      const variance = (Math.random() - 0.5) * baseValue * 0.1;
      data.push(Math.max(0, baseValue + variance));
    }

    return {
      labels,
      datasets: [
        {
          data,
          fill: true,
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        },
      ],
    };
  }, [selectedPeriod, portfolioData.totalValue]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  const getMiniChartData = (change: number) => {
    const points = 20;
    const data: number[] = [];
    const baseValue = 100;

    for (let i = 0; i < points; i++) {
      const trend = (change / 100) * (i / points) * baseValue;
      const variance = (Math.random() - 0.5) * 5;
      data.push(baseValue + trend + variance);
    }

    return {
      labels: Array(points).fill(""),
      datasets: [
        {
          data,
          borderColor: change >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
          backgroundColor: "transparent",
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5,
        },
      ],
    };
  };

  const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  useEffect(() => {
    const loadData = async () => {
      if (!userSession) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userWallets = await getWallets();
        setWallets(userWallets || []);

        const arcWallet = (userWallets || []).find(
          (w: any) => w.blockchain === "ARC-TESTNET"
        );
        if (arcWallet) {
          setWalletAddress(arcWallet.address);
        }

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
        setBalances(balanceMap);

        try {
          const userActivities = await getActivities(10);
          setActivities(userActivities);
        } catch (err) {
          console.warn(
            "Activities not available yet. Make sure backend is running and rebuilt:",
            err
          );
          setActivities([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) {
      loadData();
    }
  }, [
    isInitialized,
    userSession,
    getWallets,
    getBalance,
    getActivities,
    router,
  ]);

  useEffect(() => {
    const loadVaultAndUSDC = async () => {
      if (!walletAddress) return;

      try {
        const [vault, usdc] = await Promise.all([
          fetchVaultData(),
          getUSDCBalance(),
        ]);

        setVaultData({
          userAssets: vault.userAssets || "0",
          userShares: vault.userShares || "0",
        });
        setUsdcBalance(usdc || "0");
      } catch (err) {
        console.error("Failed to load vault/USDC data:", err);
      }
    };

    loadVaultAndUSDC();
    const interval = setInterval(loadVaultAndUSDC, 10000);
    return () => clearInterval(interval);
  }, [walletAddress, fetchVaultData, getUSDCBalance]);

  const formatActivityLabel = (activity: Activity): string => {
    const actionLabels: { [key: string]: string } = {
      user_login: "Logged in",
      user_created: "Account created",
      wallet_created: "Created wallet",
      wallet_preference_updated: "Updated wallet preference",
      deposit: "Deposited funds",
      withdrawal: "Withdrew funds",
      trade: "Executed trade",
      strategy_created: "Created strategy",
    };

    return actionLabels[activity.actionType] || activity.actionType;
  };

  const getActivityIcon = (actionType: string) => {
    if (actionType.includes("deposit") || actionType.includes("Bought")) {
      return "✓";
    }
    if (
      actionType.includes("withdrawal") ||
      actionType.includes("Rebalanced")
    ) {
      return "✓";
    }
    if (actionType.includes("Closed") || actionType.includes("Monitor")) {
      return actionType.includes("Closed") ? "✓" : "";
    }
    return "✓";
  };

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Main Content */}
      <div className="px-4 max-w-2xl mx-auto">
        {/* Portfolio Value */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            {/* Left: Vault Position */}
            <div>
              <h2 className="text-sm font-medium text-gray-600 mb-1">
                Vault Position:
              </h2>
              <h1 className="text-4xl font-bold text-gray-900">
                ${parseFloat(vaultData.userAssets).toFixed(2)}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {parseFloat(vaultData.userShares).toFixed(2)} shares
              </p>
            </div>

            {/* Right: USDC Balance */}
            <div className="text-right">
              <h2 className="text-sm font-medium text-gray-600 mb-1">
                USDC Balance:
              </h2>
              <h1 className="text-2xl font-bold text-gray-900">
                ${parseFloat(usdcBalance).toFixed(2)}
              </h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex-1 py-3 px-6 bg-gray-100 text-gray-900 font-semibold rounded-full hover:bg-gray-200 transition-colors"
          >
            Deposit
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 py-3 px-6 bg-gray-100 text-gray-900 font-semibold rounded-full hover:bg-gray-200 transition-colors"
          >
            Withdraw
          </button>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center justify-between mb-4">
          {(["1D", "1W", "1M", "3M", "1Y", "All"] as TimePeriod[]).map(
            (period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  selectedPeriod === period
                    ? "text-gray-900 font-semibold"
                    : "text-gray-400"
                }`}
              >
                {period}
              </button>
            )
          )}
        </div>

        {/* Chart */}
        <div className="h-48 mb-8">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Your Assets */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Your Assets</h3>
              <p className="text-sm text-gray-500">
                Current Strategy: Balanced Strategy
              </p>
            </div>
            <button className="text-gray-400">
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

          {/* Asset Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {portfolioData.tokens.slice(0, 4).map((token) => (
              <div
                key={token.symbol}
                className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="mb-2">
                  <h4 className="text-base font-bold text-gray-900">
                    {token.symbol}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {token.percentage.toFixed(0)}%
                  </p>
                </div>
                <div className="h-12 mb-2">
                  <Line
                    data={getMiniChartData(token.change)}
                    options={miniChartOptions}
                  />
                </div>
                <p
                  className={`text-sm font-semibold ${
                    token.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {token.change >= 0 ? "+" : ""}
                  {token.change.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          {activities.length > 0 && (
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => {
                const label = formatActivityLabel(activity);
                const icon = getActivityIcon(label);
                const isCompleted =
                  activity.actionType.includes("created") ||
                  activity.actionType.includes("login") ||
                  activity.actionType === "wallet_preference_updated";

                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5 ${
                        isCompleted
                          ? "bg-gray-900 border-gray-900"
                          : "border-gray-300"
                      }`}
                    >
                      {isCompleted && (
                        <svg
                          className="w-4 h-4 text-white"
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
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          isCompleted
                            ? "text-gray-400 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {label}
                      </p>
                      <p className="text-sm text-gray-400">
                        {activity.metadata?.details ||
                          new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Placeholder activities for demo */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded border-2 border-gray-300 mt-0.5"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Monitor market trends
                  </p>
                  <p className="text-sm text-gray-400">
                    Awaiting further analysis
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded border-2 border-gray-300 mt-0.5"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Review asset allocation
                  </p>
                  <p className="text-sm text-gray-400">Pending market update</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Vault Action Modals */}
      <VaultActionModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        action="deposit"
      />
      <VaultActionModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        action="withdraw"
      />
    </div>
  );
}
