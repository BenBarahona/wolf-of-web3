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

export function CircleVaultInterface() {
  const { userSession } = useCircle();
  const { getWallets } = useWallets();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
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

  // USDC state
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
  const isSuccess = success;
  const error = vaultError || approveError;

  useEffect(() => {
    const loadWallet = async () => {
      if (!userSession) return;

      try {
        const wallets = await getWallets();
        console.log("Loaded wallets:", wallets);

        if (wallets && wallets.length > 0) {
          const arcWallet = wallets.find(
            (w: any) => w.blockchain === "ARC-TESTNET"
          );
          console.log("Found ARC wallet:", arcWallet);

          if (arcWallet) {
            setWalletId(arcWallet.id);
            setAddress(arcWallet.address);
            console.log(
              "Set walletId:",
              arcWallet.id,
              "address:",
              arcWallet.address
            );
          } else {
            console.warn("No ARC-TESTNET wallet found");
          }
        } else {
          console.warn("No wallets returned from getWallets");
        }
      } catch (error) {
        console.error("Failed to load wallet:", error);
      }
    };

    loadWallet();
  }, [userSession, getWallets]);

  useEffect(() => {
    const loadVaultData = async () => {
      if (!address) return;

      const data = await getVaultData();
      setVaultData(data);
    };

    loadVaultData();
    const interval = setInterval(loadVaultData, 10000);

    return () => clearInterval(interval);
  }, [address, getVaultData]);

  useEffect(() => {
    const loadUSDCData = async () => {
      if (!address) return;

      const [balance, allowance] = await Promise.all([
        getBalance(),
        getAllowance(vaultAddress),
      ]);

      setUsdcBalance(balance);
      setUsdcAllowance(allowance);
    };

    loadUSDCData();
    const interval = setInterval(loadUSDCData, 10000);

    return () => clearInterval(interval);
  }, [address, getBalance, getAllowance, vaultAddress]);

  const handleApprove = async (amount?: string) => {
    console.log("handleApprove called", {
      walletId,
      amount,
      userSession: !!userSession,
    });

    if (!walletId) {
      console.error("No walletId available");
      return;
    }

    try {
      setSuccess(false);
      console.log("Calling approve function...");

      if (amount) {
        await approve(walletId, vaultAddress, amount);
      } else {
        console.log("Calling approveMax...");
        await approveMax(walletId, vaultAddress);
      }

      console.log("Approve completed successfully");
      setSuccess(true);

      const newAllowance = await getAllowance(vaultAddress);
      setUsdcAllowance(newAllowance);
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  };

  const handleDeposit = async () => {
    if (!address || !depositAmount || !walletId) return;

    console.log("[handleDeposit] Starting deposit:", {
      address,
      depositAmount,
      walletId,
    });

    try {
      setSuccess(false);
      console.log("[handleDeposit] Calling deposit function...");
      await deposit(walletId, depositAmount, address as `0x${string}`);
      console.log("[handleDeposit] Deposit transaction completed");
      setSuccess(true);
      setDepositAmount("");

      console.log("[handleDeposit] Refreshing vault data...");
      const [data, balance, allowance] = await Promise.all([
        getVaultData(),
        getBalance(),
        getAllowance(vaultAddress),
      ]);
      console.log("[handleDeposit] Received updated data:", {
        data,
        balance,
        allowance,
      });
      setVaultData(data);
      setUsdcBalance(balance);
      setUsdcAllowance(allowance);
      console.log("[handleDeposit] UI state updated");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!address || !withdrawAmount || !walletId) return;

    try {
      setSuccess(false);
      await withdraw(
        walletId,
        withdrawAmount,
        address as `0x${string}`,
        address as `0x${string}`
      );
      setSuccess(true);
      setWithdrawAmount("");

      const [data, balance] = await Promise.all([getVaultData(), getBalance()]);
      setVaultData(data);
      setUsdcBalance(balance);
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  const cooldownPassed =
    vaultData.lastDepositTimestamp > 0
      ? Date.now() / 1000 > vaultData.lastDepositTimestamp + vaultData.cooldown
      : true;

  const needsApproval =
    !!depositAmount && parseFloat(usdcAllowance) < parseFloat(depositAmount);
  const hasInsufficientBalance =
    !!depositAmount && parseFloat(usdcBalance) < parseFloat(depositAmount);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Low Risk Lending Vault</h2>

        {/* Connection Status */}
        <div className="mb-6">
          {address && userSession ? (
            <div className="bg-green-900/30 border border-green-600 rounded p-4">
              <p className="text-sm text-green-400">
                ✓ Connected with Circle Wallet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-900/30 border border-yellow-600 rounded p-4">
              <p className="text-sm text-yellow-400">
                Please set up your Circle Wallet first
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Go to the wallet setup page to create or restore your wallet
              </p>
            </div>
          )}
        </div>

        {address && userSession && (
          <>
            {/* Wallet Balance */}
            <div className="bg-blue-900/30 border border-blue-600 rounded p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Your USDC Balance</p>
                  <p className="text-2xl font-bold">{usdcBalance} USDC</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Vault Allowance</p>
                  <p className="text-lg font-semibold">
                    {parseFloat(usdcAllowance) > 1000000
                      ? "Unlimited"
                      : `${usdcAllowance} USDC`}
                  </p>
                </div>
              </div>
            </div>

            {/* Vault Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400">Total Value Locked</p>
                <p className="text-xl font-bold">
                  {vaultData.totalAssets} USDC
                </p>
              </div>
              <div className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400">TVL Cap</p>
                <p className="text-xl font-bold">
                  {vaultData.maxTotalAssets === "0"
                    ? "Unlimited"
                    : `${vaultData.maxTotalAssets} USDC`}
                </p>
              </div>
              <div className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400">Your Deposit</p>
                <p className="text-xl font-bold">{vaultData.userAssets} USDC</p>
              </div>
              <div className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400">Your Shares</p>
                <p className="text-xl font-bold">{vaultData.userShares}</p>
              </div>
            </div>

            {/* Cooldown Info */}
            {vaultData.cooldown > 0 && (
              <div className="bg-blue-900/30 border border-blue-600 rounded p-4 mb-6">
                <p className="text-sm">
                  <strong>Cooldown Period:</strong> {vaultData.cooldown} seconds
                </p>
                {vaultData.lastDepositTimestamp > 0 && (
                  <p className="text-sm mt-1">
                    <strong>Withdrawal Status:</strong>{" "}
                    {cooldownPassed ? (
                      <span className="text-green-400">Available</span>
                    ) : (
                      <span className="text-yellow-400">
                        Locked (wait{" "}
                        {Math.ceil(
                          vaultData.cooldown -
                            (Date.now() / 1000 - vaultData.lastDepositTimestamp)
                        )}{" "}
                        seconds)
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Approval Section */}
            {needsApproval && (
              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Approval Required
                </h3>
                <p className="text-sm text-yellow-200 mb-3">
                  You need to approve the vault to spend your USDC before
                  depositing. Current allowance: {usdcAllowance} USDC
                </p>
                {!walletId && (
                  <p className="text-sm text-red-400 mb-3">
                    ⚠️ Wallet not loaded. Please refresh the page or check your
                    wallet setup.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(depositAmount)}
                    disabled={isPending || !walletId}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approveLoading
                      ? "Approving..."
                      : `Approve ${depositAmount} USDC`}
                  </button>
                  <button
                    onClick={() => handleApprove()}
                    disabled={isPending || !walletId}
                    className="px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approveLoading ? "Approving..." : "Approve Unlimited"}
                  </button>
                </div>
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
                  className="flex-1 px-4 py-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-white"
                />
                <button
                  onClick={handleDeposit}
                  disabled={
                    isPending ||
                    !depositAmount ||
                    needsApproval ||
                    hasInsufficientBalance ||
                    false
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {vaultWriteLoading ? "Depositing..." : "Deposit"}
                </button>
              </div>
              {hasInsufficientBalance && (
                <p className="text-sm text-red-400 mt-2">
                  Insufficient USDC balance
                </p>
              )}
              {needsApproval && !hasInsufficientBalance && (
                <p className="text-sm text-yellow-400 mt-2">
                  Please approve USDC spending first
                </p>
              )}
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
                  className="flex-1 px-4 py-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-white"
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
                <p className="text-green-400">
                  ✓ Transaction submitted successfully!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Check your Circle wallet for transaction status
                </p>
              </div>
            )}
            {error && (
              <div className="bg-red-900/30 border border-red-600 rounded p-4 mt-4">
                <p className="text-red-400">
                  Error:{" "}
                  {typeof error === "string"
                    ? error
                    : (error as any)?.message || "Unknown error"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
