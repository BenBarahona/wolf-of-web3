"use client";

import { useState, useEffect } from "react";
import {
  CONTRACT_ADDRESSES,
  useCircleVaultRead,
  useCircleVaultWrite,
  useUSDCRead,
  useUSDCWrite,
} from "@/lib/contracts";
import { useCircle } from "@/lib/circle";
import { useWallets } from "@/lib/circle/hooks";

interface VaultActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "deposit" | "withdraw";
}

export function VaultActionModal({
  isOpen,
  onClose,
  action,
}: VaultActionModalProps) {
  const { userSession } = useCircle();
  const { getWallets } = useWallets();
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [vaultData, setVaultData] = useState({
    totalAssets: "0",
    maxTotalAssets: "0",
    cooldown: 0,
    userShares: "0",
    userAssets: "0",
    lastDepositTimestamp: 0,
  });

  const [usdcBalance, setUsdcBalance] = useState("0");
  const [usdcAllowance, setUsdcAllowance] = useState("0");

  const vaultAddress = CONTRACT_ADDRESSES.arc
    .lowRiskLendingVault as `0x${string}`;

  const { getVaultData, loading: readLoading } = useCircleVaultRead(
    vaultAddress,
    address as `0x${string}`
  );

  const {
    deposit,
    withdraw,
    loading: vaultWriteLoading,
    error: vaultError,
  } = useCircleVaultWrite(vaultAddress);

  const { getBalance, getAllowance } = useUSDCRead(address as `0x${string}`);
  const {
    approve,
    approveMax,
    loading: approveLoading,
    error: approveError,
  } = useUSDCWrite();

  const [success, setSuccess] = useState(false);
  const isPending = vaultWriteLoading || approveLoading;
  const error = vaultError || approveError;

  useEffect(() => {
    const loadWallet = async () => {
      if (!userSession) return;

      try {
        const wallets = await getWallets();
        if (wallets && wallets.length > 0) {
          const arcWallet = wallets.find(
            (w: any) => w.blockchain === "ARC-TESTNET"
          );

          if (arcWallet) {
            setWalletId(arcWallet.id);
            setAddress(arcWallet.address);
          }
        }
      } catch (error) {
        console.error("Failed to load wallet:", error);
      }
    };

    if (isOpen) {
      loadWallet();
    }
  }, [isOpen, userSession, getWallets]);

  useEffect(() => {
    const loadData = async () => {
      if (!address) return;

      const [data, balance, allowance] = await Promise.all([
        getVaultData(),
        getBalance(),
        getAllowance(vaultAddress),
      ]);

      setVaultData(data);
      setUsdcBalance(balance);
      setUsdcAllowance(allowance);
    };

    if (isOpen && address) {
      loadData();
    }
  }, [isOpen, address, getVaultData, getBalance, getAllowance, vaultAddress]);

  const handleApprove = async (specificAmount?: string) => {
    if (!walletId) return;

    try {
      setSuccess(false);
      if (specificAmount) {
        await approve(walletId, vaultAddress, specificAmount);
      } else {
        await approveMax(walletId, vaultAddress);
      }
      setSuccess(true);

      const newAllowance = await getAllowance(vaultAddress);
      setUsdcAllowance(newAllowance);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleDeposit = async () => {
    if (!address || !amount || !walletId) return;

    try {
      setSuccess(false);
      await deposit(walletId, amount, address as `0x${string}`);
      setSuccess(true);
      setAmount("");

      const [data, balance, allowance] = await Promise.all([
        getVaultData(),
        getBalance(),
        getAllowance(vaultAddress),
      ]);
      setVaultData(data);
      setUsdcBalance(balance);
      setUsdcAllowance(allowance);

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!address || !amount || !walletId) return;

    try {
      setSuccess(false);
      await withdraw(
        walletId,
        amount,
        address as `0x${string}`,
        address as `0x${string}`
      );
      setSuccess(true);
      setAmount("");

      const [data, balance] = await Promise.all([getVaultData(), getBalance()]);
      setVaultData(data);
      setUsdcBalance(balance);

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  const cooldownPassed =
    vaultData.lastDepositTimestamp > 0
      ? Date.now() / 1000 > vaultData.lastDepositTimestamp + vaultData.cooldown
      : true;

  const needsApproval =
    action === "deposit" &&
    !!amount &&
    parseFloat(usdcAllowance) < parseFloat(amount);

  const hasInsufficientBalance =
    action === "deposit" &&
    !!amount &&
    parseFloat(usdcBalance) < parseFloat(amount);

  const canWithdraw =
    action === "withdraw" &&
    cooldownPassed &&
    parseFloat(vaultData.userAssets) > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {action === "deposit" ? "Deposit USDC" : "Withdraw USDC"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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

          {/* Balance Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Available Balance</span>
              <span className="text-sm font-semibold text-gray-900">
                {usdcBalance} USDC
              </span>
            </div>
            {action === "withdraw" && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Your Deposit</span>
                <span className="text-sm font-semibold text-gray-900">
                  {vaultData.userAssets} USDC
                </span>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
              />
              <button
                onClick={() =>
                  setAmount(
                    action === "deposit" ? usdcBalance : vaultData.userAssets
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                MAX
              </button>
            </div>
            {hasInsufficientBalance && (
              <p className="text-sm text-red-500 mt-2">
                Insufficient USDC balance
              </p>
            )}
            {action === "withdraw" && !cooldownPassed && (
              <p className="text-sm text-yellow-600 mt-2">
                Withdrawal locked due to cooldown period
              </p>
            )}
          </div>

          {/* Approval Section */}
          {needsApproval && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                Approval Required
              </h3>
              <p className="text-xs text-yellow-700 mb-3">
                Allow the vault to spend your USDC. Current allowance:{" "}
                {usdcAllowance} USDC
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(amount)}
                  disabled={isPending}
                  className="flex-1 py-2 px-4 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {approveLoading ? "Approving..." : `Approve ${amount}`}
                </button>
                <button
                  onClick={() => handleApprove()}
                  disabled={isPending}
                  className="flex-1 py-2 px-4 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {approveLoading ? "Approving..." : "Approve Max"}
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={action === "deposit" ? handleDeposit : handleWithdraw}
            disabled={
              isPending ||
              !amount ||
              (action === "deposit"
                ? needsApproval || hasInsufficientBalance
                : !canWithdraw)
            }
            className={`w-full py-4 px-6 text-white text-lg font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              action === "deposit"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isPending
              ? action === "deposit"
                ? "Depositing..."
                : "Withdrawing..."
              : action === "deposit"
                ? "Deposit"
                : "Withdraw"}
          </button>

          {/* Status Messages */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800">
                ✓ Transaction submitted successfully!
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">
                {typeof error === "string"
                  ? error
                  : (error as any)?.message || "Transaction failed"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
