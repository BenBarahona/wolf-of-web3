"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCircle,
  useCreateUser,
  useSetupPIN,
  useWallets,
} from "@/lib/circle";

type SetupStep =
  | "initial"
  | "creating-user"
  | "setting-pin"
  | "creating-wallet";

export default function SignUpPage() {
  const router = useRouter();
  const { isInitialized } = useCircle();
  const { createUser } = useCreateUser();
  const { setupPIN } = useSetupPIN();
  const { getWallets } = useWallets();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [step, setStep] = useState<SetupStep>("initial");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setError(null);
      setStep("creating-user");

      await createUser(undefined, email, username || undefined);
      console.log("User created successfully");

      setStep("setting-pin");
    } catch (err: any) {
      console.error("User creation error:", err);
      setError(err.message || "Failed to create account. Please try again.");
      setStep("initial");
    }
  };

  const handlePINSetup = async () => {
    try {
      setError(null);

      const pinSuccess = await setupPIN();

      if (!pinSuccess) {
        throw new Error("PIN setup failed");
      }
      console.log("PIN setup successful");

      setStep("creating-wallet");
      const userWallets = await getWallets();

      if (!userWallets || userWallets.length === 0) {
        throw new Error("No wallets found after creation");
      }
      console.log("Wallet created successfully:", userWallets[0].address);

      sessionStorage.setItem("signupEmail", email);
      sessionStorage.setItem("signupUsername", username);

      router.push("/questionnaire/investment");
    } catch (err: any) {
      console.error("Wallet creation error:", err);
      setError(err.message || "Failed to create wallet. Please try again.");
      setStep("setting-pin");
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold mb-2 text-black">
          Let&apos;s create your account
        </h1>
        <p className="text-gray-600 mb-6">Fill the required information</p>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-200 rounded-full" />
          <div className="h-1 flex-1 bg-blue-200 rounded-full" />
          <div className="h-1 flex-1 bg-blue-200 rounded-full" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading States */}
        {step === "creating-user" && (
          <div className="text-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-700 font-medium">
              Creating your account...
            </p>
            <p className="text-sm text-gray-500">Please wait</p>
          </div>
        )}

        {step === "setting-pin" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors"
            >
              Set PIN
            </button>
          </div>
        )}

        {step === "creating-wallet" && (
          <div className="text-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-700 font-medium">
              Creating your Smart Wallet...
            </p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        )}

        {step === "initial" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Username <span className="text-gray-400">- optional</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="WolfOfWeb3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Benefits Box */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <p className="font-semibold text-black mb-4">
                What you&apos;ll get:
              </p>
              <div className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✓</span>
                <p className="text-sm text-gray-700">
                  Circle Smart Contract Account (SCA)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✓</span>
                <p className="text-sm text-gray-700">
                  No seed phrases - just a simple PIN
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✓</span>
                <p className="text-sm text-gray-700">
                  AI-powered investment strategies
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✓</span>
                <p className="text-sm text-gray-700">
                  Autonomous trading on DeFi Protocols
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors"
            >
              Create Smart Wallet
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
