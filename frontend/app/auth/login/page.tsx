"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCircle, useSetupPIN, useWallets } from "@/lib/circle";
import * as circleApi from "@/lib/circle/api";

export default function LoginPage() {
  const router = useRouter();
  const { setUserSession, isInitialized } = useCircle();
  const { setupPIN } = useSetupPIN();
  const { getWallets } = useWallets();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "pin">("email");

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

    setIsLoading(true);
    setError(null);

    try {
      const userData = await circleApi.loginUser(email);

      setUserSession(userData);

      setStep("pin");
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to login. Have you created an account?");
      setIsLoading(false);
    }
  };

  const handlePINVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await setupPIN();

      if (success) {
        const userWallets = await getWallets();

        if (userWallets && userWallets.length > 0) {
          router.push("/dashboard");
        } else {
          throw new Error("No wallets found for this account");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify PIN");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-bold mb-8 text-black">
          Login to your account
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            {/* Email */}
            <div className="mb-8">
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
                disabled={isLoading}
              />
            </div>

            {/* Spacer to push button to bottom */}
            <div className="flex-1" />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isInitialized}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Continue"}
            </button>
          </form>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* PIN Setup Instructions */}
            <div className="text-center space-y-4 mb-8">
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
                Enter Your PIN
              </h2>
              <p className="text-gray-600">
                Enter your 6-digit PIN to access your wallet
              </p>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Verify PIN Button */}
            <button
              onClick={handlePINVerification}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify PIN"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
