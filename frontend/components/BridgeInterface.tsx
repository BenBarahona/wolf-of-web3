"use client";

import { useState, useEffect } from "react";
import { useCircle, useWallets } from "@/lib/circle";
import {
  useBridgeTransfer,
  useBridgeEstimates,
  SUPPORTED_CHAINS,
  getVaultInfo,
  getChainName,
  RISK_LEVEL_COLORS,
  type SupportedChainId,
} from "@/lib/bridge";

export function BridgeInterface() {
  const { userSession, isInitialized } = useCircle();
  const { getWallets } = useWallets();
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get user's wallet address
  useEffect(() => {
    const fetchWallet = async () => {
      if (userSession && isInitialized) {
        try {
          const wallets = await getWallets();
          if (wallets && wallets.length > 0) {
            setAddress(wallets[0].address);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Failed to fetch wallet:", error);
        }
      }
    };
    fetchWallet();
  }, [userSession, isInitialized, getWallets]);

  const [sourceChainId, setSourceChainId] = useState<SupportedChainId | null>(
    null
  );
  const [destinationChainId, setDestinationChainId] =
    useState<SupportedChainId | null>(null);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const { transfer, status, isLoading, error, reset } = useBridgeTransfer();
  const { estimatedTime, estimatedFee } = useBridgeEstimates(
    sourceChainId,
    destinationChainId,
    amount
  );

  const handleTransfer = async () => {
    if (!sourceChainId || !destinationChainId || !amount) {
      return;
    }

    const recipient = recipientAddress || address;
    if (!recipient) {
      return;
    }

    await transfer({
      sourceChainId,
      destinationChainId,
      amount,
      recipientAddress: recipient as `0x${string}`,
    });
  };

  const isValidTransfer =
    sourceChainId && destinationChainId && amount && parseFloat(amount) > 0;
  const sourceVault = sourceChainId ? getVaultInfo(sourceChainId) : null;
  const destVault = destinationChainId
    ? getVaultInfo(destinationChainId)
    : null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Cross-Chain Bridge</h2>
        <p className="text-gray-400 mb-6">
          Transfer USDC between chains to access different vault strategies
        </p>

        {/* Wallet Connection */}
        {!isConnected && (
          <div className="mb-6 text-center py-8">
            <p className="text-gray-400 mb-4">
              Please sign in with your Circle wallet to use the bridge
            </p>
            <a
              href="/auth/signup"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In / Create Account
            </a>
          </div>
        )}

        {isConnected && (
          <>
            {/* Source Chain Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Chain
              </label>
              <select
                value={sourceChainId || ""}
                onChange={(e) => {
                  const chainId = parseInt(e.target.value) as SupportedChainId;
                  setSourceChainId(chainId || null);
                  if (chainId === destinationChainId) {
                    setDestinationChainId(null);
                  }
                }}
                className="w-full px-4 py-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select source chain</option>
                {SUPPORTED_CHAINS.map((chain) => {
                  const vault = getVaultInfo(chain.id);
                  return (
                    <option key={chain.id} value={chain.id}>
                      {chain.name} - {vault.name} (
                      {vault.riskLevel.toUpperCase()})
                    </option>
                  );
                })}
              </select>
              {sourceVault && (
                <div
                  className={`mt-2 p-3 rounded border ${RISK_LEVEL_COLORS[sourceVault.riskLevel].bg} ${RISK_LEVEL_COLORS[sourceVault.riskLevel].border}`}
                >
                  <p
                    className={`text-sm ${RISK_LEVEL_COLORS[sourceVault.riskLevel].text}`}
                  >
                    {sourceVault.description}
                  </p>
                </div>
              )}
            </div>

            {/* Destination Chain Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Chain
              </label>
              <select
                value={destinationChainId || ""}
                onChange={(e) => {
                  const chainId = parseInt(e.target.value) as SupportedChainId;
                  setDestinationChainId(chainId || null);
                }}
                className="w-full px-4 py-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                disabled={!sourceChainId}
              >
                <option value="">Select destination chain</option>
                {SUPPORTED_CHAINS.filter(
                  (chain) => chain.id !== sourceChainId
                ).map((chain) => {
                  const vault = getVaultInfo(chain.id);
                  return (
                    <option key={chain.id} value={chain.id}>
                      {chain.name} - {vault.name} (
                      {vault.riskLevel.toUpperCase()})
                    </option>
                  );
                })}
              </select>
              {destVault && (
                <div
                  className={`mt-2 p-3 rounded border ${RISK_LEVEL_COLORS[destVault.riskLevel].bg} ${RISK_LEVEL_COLORS[destVault.riskLevel].border}`}
                >
                  <p
                    className={`text-sm ${RISK_LEVEL_COLORS[destVault.riskLevel].text}`}
                  >
                    {destVault.description}
                  </p>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                disabled={!sourceChainId || !destinationChainId}
              />
            </div>

            {/* Recipient Address (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Address (optional)
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder={`Leave empty to send to ${address?.slice(0, 6)}...${address?.slice(-4)}`}
                className="w-full px-4 py-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                disabled={!isValidTransfer}
              />
            </div>

            {/* Transfer Estimates */}
            {isValidTransfer && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Time:</span>
                  <span className="text-white">{estimatedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Fee:</span>
                  <span className="text-white">{estimatedFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">You Will Receive:</span>
                  <span className="text-white font-semibold">
                    ~{(parseFloat(amount) - 0.01).toFixed(2)} USDC
                  </span>
                </div>
              </div>
            )}

            {/* Transfer Button */}
            <button
              onClick={handleTransfer}
              disabled={!isValidTransfer || isLoading}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {isLoading ? "Processing..." : "Bridge USDC"}
            </button>

            {/* Status Display */}
            {status && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  status.status === "completed"
                    ? "bg-green-900/30 border-green-600"
                    : status.status === "failed"
                      ? "bg-red-900/30 border-red-600"
                      : "bg-blue-900/30 border-blue-600"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">Transfer Status</span>
                  {status.status !== "completed" &&
                    status.status !== "failed" && (
                      <span className="text-xs px-2 py-1 bg-blue-600 rounded">
                        IN PROGRESS
                      </span>
                    )}
                </div>
                <p className="text-sm mb-2">{status.message}</p>
                {status.transactionHash && (
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-gray-400">Transaction: </span>
                      <a
                        href={`${sourceChainId ? getVaultInfo(sourceChainId) : "#"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline break-all"
                      >
                        {status.transactionHash.slice(0, 10)}...
                        {status.transactionHash.slice(-8)}
                      </a>
                    </div>
                  </div>
                )}
                {(status.status === "completed" ||
                  status.status === "failed") && (
                  <button
                    onClick={reset}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Start New Transfer
                  </button>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-900/30 border border-red-600 rounded-lg p-4">
                <p className="text-red-400 font-semibold mb-1">
                  Transfer Failed
                </p>
                <p className="text-sm text-red-300">{error.message}</p>
                <button
                  onClick={reset}
                  className="mt-3 text-sm text-red-400 hover:text-red-300"
                >
                  Try Again
                </button>
              </div>
            )}
          </>
        )}

        {!isConnected && (
          <div className="text-center py-8 text-gray-400">
            Connect your wallet to start bridging USDC
          </div>
        )}
      </div>
    </div>
  );
}
