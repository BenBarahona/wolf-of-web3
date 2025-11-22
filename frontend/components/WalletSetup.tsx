"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCircle,
  useCreateUser,
  useSetupPIN,
  useCreateWallet,
  useWallets,
} from "@/lib/circle";

type SetupStep =
  | "initial"
  | "creating-user"
  | "setting-pin"
  | "creating-wallet"
  | "complete";

export default function WalletSetup() {
  const router = useRouter();
  const { userSession, isInitialized, clearSession } = useCircle();
  const { createUser } = useCreateUser();
  const { setupPIN } = useSetupPIN();
  const { createWallet } = useCreateWallet();
  const { getWallets } = useWallets();

  const [step, setStep] = useState<SetupStep>("initial");
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);

  // Check for existing wallets on mount
  useEffect(() => {
    const checkExistingWallets = async () => {
      if (userSession) {
        try {
          const userWallets = await getWallets();
          if (userWallets && userWallets.length > 0) {
            setWallets(userWallets);
            setWalletAddress(userWallets[0].address);
            setStep("complete");
          }
        } catch (err) {
          console.error("Error checking wallets:", err);
        }
      }
    };

    if (isInitialized && userSession) {
      checkExistingWallets();
    }
  }, [isInitialized, userSession, getWallets]);

  const handleStartSetup = async () => {
    try {
      setError(null);
      setStep("creating-user");

      const userData = await createUser();
      console.log("User created with challengeId:", userData.challengeId);

      // User is created and initialized, now prompt for PIN setup
      setStep("setting-pin");
    } catch (err: any) {
      setError(err.message || "Failed to create user");
      setStep("initial");
    }
  };

  const handlePINSetup = async () => {
    try {
      setError(null);

      // Execute the PIN setup challenge
      // Note: According to Circle docs, the wallet is created automatically
      // as part of the /user/initialize endpoint when the PIN challenge completes
      const success = await setupPIN();

      if (success) {
        console.log("PIN setup successful - wallet created automatically");

        // Fetch the wallets that were just created
        setStep("creating-wallet");
        await fetchWallets();
      }
    } catch (err: any) {
      setError(err.message || "Failed to setup PIN");
      setStep("setting-pin");
    }
  };

  const fetchWallets = async () => {
    try {
      setError(null);

      // Fetch wallets created during initialization
      const userWallets = await getWallets();

      if (userWallets && userWallets.length > 0) {
        console.log("Wallets fetched:", userWallets);
        setWallets(userWallets);
        setWalletAddress(userWallets[0].address);
        setStep("complete");

        // Optionally auto-redirect to dashboard after a brief delay
        // Uncomment the lines below to enable auto-redirect
        // setTimeout(() => {
        //   router.push("/dashboard");
        // }, 2000);
      } else {
        throw new Error("No wallets found. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch wallets");
      setStep("setting-pin");
    }
  };

  const handleCreateWallet = async () => {
    // This function is kept for backwards compatibility
    // but is no longer used in the primary flow
    try {
      setError(null);

      const wallet = await createWallet("ARC-TESTNET", "SCA");
      console.log("Additional wallet created:", wallet);

      setWalletAddress(wallet.address);
      setStep("complete");

      const userWallets = await getWallets();
      setWallets(userWallets);
    } catch (err: any) {
      setError(err.message || "Failed to create wallet");
      setStep("setting-pin");
    }
  };

  const handleLogout = () => {
    clearSession();
    setStep("initial");
    setWalletAddress(null);
    setWallets([]);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Circle SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wolf of Web3
          </h1>
          <p className="text-gray-600">Your AI-Powered Personal Broker</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Content based on step */}
        {step === "initial" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Create your Circle Smart Wallet to start investing with
                AI-powered strategies.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What you'll get:
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 text-left">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Circle Smart Contract Account (SCA)</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>No seed phrases - just a simple PIN</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>AI-powered investment strategies</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Autonomous trading on DeFi protocols</span>
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleStartSetup}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
            >
              Create Smart Wallet
            </button>
          </div>
        )}

        {step === "creating-user" && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-700">Creating your account...</p>
          </div>
        )}

        {step === "setting-pin" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Set Your PIN
              </h2>
              <p className="text-gray-600">
                Create a secure 6-digit PIN to protect your wallet. You'll use
                this PIN to approve transactions.
              </p>
            </div>
            <button
              onClick={handlePINSetup}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Set PIN
            </button>
          </div>
        )}

        {step === "creating-wallet" && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-700">Creating your Smart Wallet...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        )}

        {step === "complete" && walletAddress && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Wallet Created! 🎉
              </h2>
              <p className="text-gray-600">
                Your Circle Smart Wallet is ready to use.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Wallet Address
                </label>
                <p className="text-sm font-mono text-gray-900 break-all mt-1">
                  {walletAddress}
                </p>
              </div>
              {wallets.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Blockchain
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {wallets[0].blockchain}
                  </p>
                </div>
              )}
              {wallets.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Account Type
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {wallets[0].accountType === "SCA"
                      ? "Smart Contract Account"
                      : "Externally Owned Account"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
