"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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

    sessionStorage.setItem("signupEmail", email);
    sessionStorage.setItem("signupUsername", username);

    router.push("/questionnaire/investment");
  };

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
              disabled={isLoading}
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
              disabled={isLoading}
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
                AI-powerade investment strategies
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
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Continuing..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
