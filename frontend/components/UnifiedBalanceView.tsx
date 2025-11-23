"use client";

import { useState, useEffect } from "react";
import {
  getUnifiedBalance,
  formatUSDC,
  getChainColor,
  getChainIcon,
  type GatewayBalanceSummary,
} from "@/lib/bridge";
import { UnifiedTransferModal } from "./UnifiedTransferModal";

interface UnifiedBalanceViewProps {
  walletAddress?: string;
}

export function UnifiedBalanceView({ walletAddress }: UnifiedBalanceViewProps) {
  const [balances, setBalances] = useState<GatewayBalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    async function fetchBalances() {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getUnifiedBalance(walletAddress);

        if (response.success && response.data) {
          setBalances(response.data);
        } else {
          setError(response.message || "Failed to fetch balances");
        }
      } catch (err: any) {
        console.error("Error fetching unified balance:", err);
        setError(err.message || "Failed to fetch balances");
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-center border border-gray-700">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔐</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400">
          Connect your Circle wallet to view your unified USDC balance across
          all chains
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-gray-700 rounded-lg" />
            <div className="h-40 bg-gray-700 rounded-lg" />
            <div className="h-40 bg-gray-700 rounded-lg" />
          </div>
        </div>
        <p className="text-center text-gray-400 mt-4">
          Loading unified balance...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-xl p-8 text-center border border-red-600/50">
        <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Error</h3>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  const totalUSDC = balances?.totalUSDC || 0;
  const chains = balances?.chains || [];

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 shadow-xl border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              🌐 Unified USDC Balance
            </p>
            <p className="text-white text-4xl font-bold">
              ${formatUSDC(totalUSDC)}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-3xl">💰</span>
          </div>
        </div>
        <p className="text-blue-100 text-sm">
          Combined balance across{" "}
          {chains.filter((c) => c.balanceFormatted > 0).length} active chain
          {chains.filter((c) => c.balanceFormatted > 0).length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Per-Chain Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {chains.map((chain) => {
          const hasBalance = chain.balanceFormatted > 0;
          const colorClass = getChainColor(chain.chainName);
          const icon = getChainIcon(chain.chainName);

          return (
            <div
              key={chain.domain}
              className={`relative overflow-hidden rounded-xl border transition-all ${
                hasBalance
                  ? "bg-gray-800 border-gray-600 shadow-lg hover:shadow-xl"
                  : "bg-gray-900 border-gray-700"
              }`}
            >
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10`}
              />

              {/* Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-xl`}
                    >
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {chain.chainName
                          .replace(" Sepolia", "")
                          .replace(" Testnet", "")}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Domain {chain.domain}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Balance */}
                <div className="bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-xs text-gray-400 mb-1">USDC Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {formatUSDC(chain.balanceFormatted)}
                  </p>
                  {hasBalance && (
                    <p className="text-xs text-gray-400 mt-1">
                      {((chain.balanceFormatted / totalUSDC) * 100).toFixed(1)}%
                      of total
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  {hasBalance ? (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-medium">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-gray-600 rounded-full" />
                      <span className="text-gray-500">No balance</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-600/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600/30 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">ℹ️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              About Unified Balance
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Your unified USDC balance is managed by{" "}
              <strong>Circle Gateway</strong>, which aggregates your USDC
              holdings across Arc Testnet, World Chain, and Base Sepolia. This
              allows for seamless cross-chain transfers and a unified view of
              your assets.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs font-medium">
                Cross-chain
              </span>
              <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs font-medium">
                Instant transfers
              </span>
              <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-xs font-medium">
                Low fees
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {totalUSDC > 0 && balances && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              🌉 Transfer Between Chains
            </button>
            <button className="px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold">
              💸 Deposit to Vault
            </button>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {balances && walletAddress && (
        <UnifiedTransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          balances={balances}
          walletAddress={walletAddress}
        />
      )}
    </div>
  );
}
