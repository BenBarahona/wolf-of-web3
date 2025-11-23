"use client";

import { useState } from "react";
import {
  formatUSDC,
  getChainIcon,
  type GatewayBalanceSummary,
} from "@/lib/bridge";

interface UnifiedTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: GatewayBalanceSummary;
  walletAddress: string;
}

export function UnifiedTransferModal({
  isOpen,
  onClose,
  balances,
  walletAddress,
}: UnifiedTransferModalProps) {
  const [sourceChain, setSourceChain] = useState("");
  const [destinationChain, setDestinationChain] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<
    "form" | "signing" | "processing" | "success" | "error"
  >("form");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const availableChains = balances.chains.filter((c) => c.balanceFormatted > 0);
  const selectedSource = balances.chains.find(
    (c) => c.chainName === sourceChain
  );
  const maxAmount = selectedSource?.balanceFormatted || 0;

  const handleTransfer = async () => {
    try {
      setStep("signing");
      // TODO: Implement burn intent signing
      // This would involve:
      // 1. Creating a burn intent with EIP-712 typed data
      // 2. Signing it with the user's wallet
      // 3. Submitting to Gateway API
      // 4. Receiving attestation
      // 5. Minting on destination chain

      // For now, show a placeholder
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("processing");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } catch (error: any) {
      setErrorMessage(error.message || "Transfer failed");
      setStep("error");
    }
  };

  const resetModal = () => {
    setStep("form");
    setSourceChain("");
    setDestinationChain("");
    setAmount("");
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {step === "form" && "🌉 Transfer USDC"}
            {step === "signing" && "✍️ Sign Transaction"}
            {step === "processing" && "⏳ Processing..."}
            {step === "success" && "✅ Transfer Complete"}
            {step === "error" && "❌ Transfer Failed"}
          </h2>
          <button
            onClick={resetModal}
            className="text-gray-400 hover:text-white transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        {step === "form" && (
          <div className="space-y-4">
            {/* Source Chain */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Chain
              </label>
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select source chain</option>
                {availableChains.map((chain) => (
                  <option key={chain.domain} value={chain.chainName}>
                    {getChainIcon(chain.chainName)} {chain.chainName} - $
                    {formatUSDC(chain.balanceFormatted)} USDC
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Chain */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Chain
              </label>
              <select
                value={destinationChain}
                onChange={(e) => setDestinationChain(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                disabled={!sourceChain}
              >
                <option value="">Select destination chain</option>
                {balances.chains
                  .filter((c) => c.chainName !== sourceChain)
                  .map((chain) => (
                    <option key={chain.domain} value={chain.chainName}>
                      {getChainIcon(chain.chainName)} {chain.chainName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Amount (USDC)
                </label>
                {selectedSource && (
                  <button
                    onClick={() => setAmount(maxAmount.toString())}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Max: ${formatUSDC(maxAmount)}
                  </button>
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={maxAmount}
                step="0.01"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                disabled={!sourceChain}
              />
            </div>

            {/* Fee Info */}
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Estimated Fee:</span>
                <span className="text-white font-semibold">~$2.01 USDC</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Fees cover CCTP attestation and destination chain gas
              </p>
            </div>

            {/* Transfer Button */}
            <button
              onClick={handleTransfer}
              disabled={
                !sourceChain ||
                !destinationChain ||
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > maxAmount
              }
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Transfer USDC
            </button>
          </div>
        )}

        {/* Signing State */}
        {step === "signing" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">
              Sign the transaction
            </p>
            <p className="text-gray-400 text-sm">
              Please sign the burn intent with your wallet
            </p>
          </div>
        )}

        {/* Processing State */}
        {step === "processing" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Processing transfer</p>
            <p className="text-gray-400 text-sm">
              Waiting for attestation and destination mint...
            </p>
          </div>
        )}

        {/* Success State */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-white font-semibold mb-2">Transfer complete!</p>
            <p className="text-gray-400 text-sm mb-6">
              Your USDC has been transferred to {destinationChain}
            </p>
            <button
              onClick={resetModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Done
            </button>
          </div>
        )}

        {/* Error State */}
        {step === "error" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✕</span>
            </div>
            <p className="text-white font-semibold mb-2">Transfer failed</p>
            <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
            <button
              onClick={() => setStep("form")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Coming Soon Notice */}
        {step === "form" && (
          <div className="mt-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
            <p className="text-xs text-yellow-300">
              <strong>Note:</strong> Transfer functionality is currently in
              development. Full implementation requires wallet signature
              integration with EIP-712 burn intents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
