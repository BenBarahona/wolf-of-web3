"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getAllVaults,
  getRiskLevelConfig,
  calculateDiversityScore,
  recommendChain,
  type VaultInfo,
} from "@/lib/contracts/multiChainVaults";
import { RISK_LEVEL_COLORS } from "@/lib/bridge";

interface HoldingData {
  vault: VaultInfo;
  balance: string;
  value: number;
}

interface MultiChainPortfolioProps {
  holdings?: HoldingData[];
}

export function MultiChainPortfolio({
  holdings = [],
}: MultiChainPortfolioProps) {
  const [selectedRisk, setSelectedRisk] = useState<
    "all" | "low" | "medium" | "high"
  >("all");

  const allVaults = getAllVaults();

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  const diversityScore = calculateDiversityScore(
    holdings.map((h) => ({
      chainId: h.vault.chainId,
      amount: h.value,
    }))
  );

  const recommendation =
    holdings.length > 0
      ? recommendChain(
          holdings.map((h) => ({
            chainId: h.vault.chainId,
            amount: h.value,
          })),
          selectedRisk === "all" ? "medium" : selectedRisk
        )
      : null;

  const filteredVaults =
    selectedRisk === "all"
      ? allVaults
      : allVaults.filter((v) => v.riskLevel === selectedRisk);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Multi-Chain Portfolio</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Total Value</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Active Chains</p>
            <p className="text-2xl font-bold">
              {new Set(holdings.map((h) => h.vault.chainId)).size}/3
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Diversity Score</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{diversityScore}/100</p>
              <div className="flex-1 bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    diversityScore > 70
                      ? "bg-green-500"
                      : diversityScore > 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${diversityScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && diversityScore < 70 && (
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">
              💡 Diversification Tip
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              Consider adding to <strong>{recommendation.vaultName}</strong> on{" "}
              <strong>{recommendation.chainName}</strong> to improve your
              portfolio diversity.
            </p>
            <Link
              href="/bridge"
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Bridge funds to {recommendation.chainName} →
            </Link>
          </div>
        )}
      </div>

      {/* Risk Filter */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedRisk("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRisk === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            All Vaults
          </button>
          <button
            onClick={() => setSelectedRisk("low")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRisk === "low"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Low Risk
          </button>
          <button
            onClick={() => setSelectedRisk("medium")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRisk === "medium"
                ? "bg-yellow-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Medium Risk
          </button>
          <button
            onClick={() => setSelectedRisk("high")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRisk === "high"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            High Risk
          </button>
        </div>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVaults.map((vault) => {
          const holding = holdings.find(
            (h) => h.vault.chainId === vault.chainId
          );
          const riskConfig = getRiskLevelConfig(vault.riskLevel);

          return (
            <div
              key={vault.chainId}
              className={`bg-gray-800 rounded-lg p-6 border-2 ${
                holding
                  ? RISK_LEVEL_COLORS[vault.riskLevel].border
                  : "border-gray-700"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{vault.vaultSymbol}</h3>
                  <p className="text-sm text-gray-400">{vault.chainName}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    RISK_LEVEL_COLORS[vault.riskLevel].bg
                  } ${RISK_LEVEL_COLORS[vault.riskLevel].text}`}
                >
                  {riskConfig.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-4">{vault.description}</p>

              {/* Expected APY */}
              <div className="bg-gray-700 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">Expected APY</p>
                <p className="text-lg font-bold text-green-400">
                  {riskConfig.expectedAPY}
                </p>
              </div>

              {/* Holdings */}
              {holding && (
                <div className="bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Your Holdings</p>
                  <p className="text-lg font-bold">{holding.balance} USDC</p>
                  <p className="text-sm text-gray-400">
                    ${holding.value.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/vault/${vault.chainId}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-semibold"
                >
                  {holding ? "Manage" : "Deposit"}
                </Link>
                {!holding && (
                  <Link
                    href="/bridge"
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-center text-sm"
                    title="Bridge funds to this chain"
                  >
                    🌉
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {holdings.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 mb-4">
            You don't have any holdings yet. Start by depositing into a vault or
            bridging funds across chains.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/vault"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Explore Vaults
            </Link>
            <Link
              href="/bridge"
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              Bridge Funds
            </Link>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="font-semibold mb-2 text-green-400">Low Risk</h3>
          <p className="text-sm text-gray-300 mb-2">
            {getRiskLevelConfig("low").description}
          </p>
          <p className="text-xs text-gray-400">
            {getRiskLevelConfig("low").suitableFor}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="font-semibold mb-2 text-yellow-400">Medium Risk</h3>
          <p className="text-sm text-gray-300 mb-2">
            {getRiskLevelConfig("medium").description}
          </p>
          <p className="text-xs text-gray-400">
            {getRiskLevelConfig("medium").suitableFor}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="font-semibold mb-2 text-red-400">High Risk</h3>
          <p className="text-sm text-gray-300 mb-2">
            {getRiskLevelConfig("high").description}
          </p>
          <p className="text-xs text-gray-400">
            {getRiskLevelConfig("high").suitableFor}
          </p>
        </div>
      </div>
    </div>
  );
}
