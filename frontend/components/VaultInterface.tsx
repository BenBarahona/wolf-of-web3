"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useVaultRead,
  useVaultWrite,
  CONTRACT_ADDRESSES,
} from "@/lib/contracts";
import { WalletConnectButton } from "./WalletConnectButton";

export function VaultInterface() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Use the Low Risk Lending Vault address (update after deployment)
  const vaultAddress = CONTRACT_ADDRESSES.arc
    .lowRiskLendingVault as `0x${string}`;

  // Read vault data
  const {
    totalAssets,
    userAssets,
    userShares,
    cooldown,
    maxTotalAssets,
    lastDepositTimestamp,
  } = useVaultRead(vaultAddress);

  // Write functions
  const { deposit, withdraw, isPending, isSuccess, error } =
    useVaultWrite(vaultAddress);

  const handleDeposit = async () => {
    if (!address || !depositAmount) return;
    await deposit(depositAmount, address);
  };

  const handleWithdraw = async () => {
    if (!address || !withdrawAmount) return;
    await withdraw(withdrawAmount, address, address);
  };

  // Calculate if cooldown has passed
  const cooldownPassed =
    lastDepositTimestamp > 0
      ? Date.now() / 1000 > lastDepositTimestamp + cooldown
      : true;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Low Risk Lending Vault</h2>

        {/* Wallet Connection */}
        <div className="mb-6">
          <WalletConnectButton />
        </div>

        {isConnected && (
          <>
            {/* Vault Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400">Total Value Locked</p>
                <p className="text-xl font-bold">{totalAssets} USDC</p>
              </div>
              <div className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400">TVL Cap</p>
                <p className="text-xl font-bold">
                  {maxTotalAssets === "0"
                    ? "Unlimited"
                    : `${maxTotalAssets} USDC`}
                </p>
              </div>
              <div className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400">Your Deposit</p>
                <p className="text-xl font-bold">{userAssets} USDC</p>
              </div>
              <div className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400">Your Shares</p>
                <p className="text-xl font-bold">{userShares}</p>
              </div>
            </div>

            {/* Cooldown Info */}
            {cooldown > 0 && (
              <div className="bg-blue-900/30 border border-blue-600 rounded p-4 mb-6">
                <p className="text-sm">
                  <strong>Cooldown Period:</strong> {cooldown} seconds
                </p>
                {lastDepositTimestamp > 0 && (
                  <p className="text-sm mt-1">
                    <strong>Withdrawal Status:</strong>{" "}
                    {cooldownPassed ? (
                      <span className="text-green-400">Available</span>
                    ) : (
                      <span className="text-yellow-400">
                        Locked (wait{" "}
                        {cooldown - (Date.now() / 1000 - lastDepositTimestamp)}{" "}
                        seconds)
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Deposit Section */}
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">Deposit USDC</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount in USDC"
                  className="flex-1 px-4 py-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleDeposit}
                  disabled={isPending || !depositAmount}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Depositing..." : "Deposit"}
                </button>
              </div>
            </div>

            {/* Withdraw Section */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Withdraw USDC</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount in USDC"
                  className="flex-1 px-4 py-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleWithdraw}
                  disabled={isPending || !withdrawAmount || !cooldownPassed}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Withdrawing..." : "Withdraw"}
                </button>
              </div>
              {!cooldownPassed && (
                <p className="text-sm text-yellow-400 mt-2">
                  Withdrawal locked due to cooldown period
                </p>
              )}
            </div>

            {/* Transaction Status */}
            {isSuccess && (
              <div className="bg-green-900/30 border border-green-600 rounded p-4 mt-4">
                <p className="text-green-400">Transaction successful!</p>
              </div>
            )}
            {error && (
              <div className="bg-red-900/30 border border-red-600 rounded p-4 mt-4">
                <p className="text-red-400">Error: {error.message}</p>
              </div>
            )}
          </>
        )}

        {!isConnected && (
          <div className="text-center py-8 text-gray-400">
            Connect your wallet to interact with the vault
          </div>
        )}
      </div>
    </div>
  );
}
