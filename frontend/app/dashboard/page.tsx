"use client";

import { useEffect, useState } from "react";
import { useCircle, useWallets, useWalletBalance } from "@/lib/circle";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { userSession, isInitialized, clearSession } = useCircle();
  const { getWallets } = useWallets();
  const { getBalance } = useWalletBalance();

  const [wallets, setWallets] = useState<any[]>([]);
  const [balances, setBalances] = useState<{ [walletId: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWallets = async () => {
      if (!userSession) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userWallets = await getWallets();
        setWallets(userWallets || []);

        // Load balances for each wallet
        const balancePromises = (userWallets || []).map(async (wallet: any) => {
          try {
            const walletBalances = await getBalance(wallet.id);
            return { walletId: wallet.id, balances: walletBalances };
          } catch (err) {
            console.error(
              `Failed to load balance for wallet ${wallet.id}:`,
              err
            );
            return { walletId: wallet.id, balances: [] };
          }
        });

        const balanceResults = await Promise.all(balancePromises);
        const balanceMap: { [walletId: string]: any[] } = {};
        balanceResults.forEach((result) => {
          balanceMap[result.walletId] = result.balances;
        });
        setBalances(balanceMap);
      } catch (err: any) {
        setError(err.message || "Failed to load wallets");
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) {
      loadWallets();
    }
  }, [isInitialized, userSession, getWallets, getBalance, router]);

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  The Wolf of Web3
                </h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Wallets Grid */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Wallets
            </h2>
            {wallets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">No wallets found</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    {/* Wallet Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            {wallet.accountType || "SCA"}
                          </p>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                wallet.state === "LIVE"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <p className="text-xs text-gray-600">
                              {wallet.state}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Network
                      </label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {wallet.blockchain}
                      </p>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Address
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <p className="text-sm font-mono text-gray-900 truncate flex-1">
                          {wallet.address}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(wallet.address);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy address"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Balances */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">
                        Balance
                      </label>
                      <div className="mt-2 space-y-1">
                        {balances[wallet.id] &&
                        balances[wallet.id].length > 0 ? (
                          balances[wallet.id].map(
                            (balance: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-600">
                                  {balance.token?.symbol || "Unknown"}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {balance.amount || "0"}
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-sm text-gray-500">No assets</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
                        View Transactions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Add Funds</h3>
              <p className="text-sm text-gray-500">
                Deposit crypto to your wallet
              </p>
            </button>

            <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Send</h3>
              <p className="text-sm text-gray-500">
                Transfer tokens to another wallet
              </p>
            </button>

            <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Trade</h3>
              <p className="text-sm text-gray-500">Swap tokens on DEXs</p>
            </button>

            <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                AI Strategies
              </h3>
              <p className="text-sm text-gray-500">Automated investment bots</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
