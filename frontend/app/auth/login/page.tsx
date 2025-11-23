"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCircle, useWallets } from "@/lib/circle";
import * as circleApi from "@/lib/circle/api";

export default function LoginPage() {
  const router = useRouter();
  const { setUserSession, isInitialized } = useCircle();
  const { getWallets } = useWallets();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    setError(null);

    try {
      const userData = await circleApi.loginUser(email);

      setUserSession(userData);

      const userWallets = await circleApi.listWallets(userData.userToken);

      if (userWallets.wallets && userWallets.wallets.length > 0) {
        console.log("Login successful, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        // User exists but has no wallet - create one
        console.log("No wallet found, creating one...");
        const newWallet = await circleApi.createWallet(
          userData.userToken,
          "ARC-TESTNET",
          "SCA"
        );
        console.log("Wallet created successfully:", newWallet.address);
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Have you created an account?");
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

          {/* Info Message */}
          {isLoading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-600">
                You may be prompted to enter your PIN to access your wallet...
              </p>
            </div>
          )}

          {/* Spacer to push button to bottom */}
          <div className="flex-1" />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isInitialized}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
