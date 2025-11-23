"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCircle, useWallets } from "@/lib/circle";
import BottomNav from "@/components/BottomNav";

export default function Settings() {
  const router = useRouter();
  const { clearSession, userSession } = useCircle();
  const { getWallets } = useWallets();

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    const loadWalletAddress = async () => {
      if (!userSession) {
        setIsLoadingWallet(false);
        return;
      }

      try {
        const wallets = await getWallets();
        if (wallets && wallets.length > 0) {
          setWalletAddress(wallets[0].address);
        }
      } catch (err) {
        console.error("Failed to load wallet address:", err);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    loadWalletAddress();
  }, [userSession, getWallets]);

  const handleCopyAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-600"
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

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Account
            </h3>
            <button className="w-full text-left py-3 px-4 bg-white rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Profile Settings</span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Wallet Address Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Circle Smart Wallet
            </h3>
            <div className="bg-white rounded-lg p-4">
              {isLoadingWallet ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              ) : walletAddress ? (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 mr-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Wallet Address
                      </p>
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {walletAddress}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress ? (
                        <svg
                          className="w-5 h-5 text-green-600"
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
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-600"
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
                      )}
                    </button>
                  </div>
                  {copiedAddress && (
                    <p className="text-xs text-green-600 font-medium">
                      Address copied to clipboard!
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 py-2">
                  No wallet address found
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Security
            </h3>
            <button className="w-full text-left py-3 px-4 bg-white rounded-lg hover:bg-gray-100 transition-colors mb-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Change PIN</span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
            <button className="w-full text-left py-3 px-4 bg-white rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Security Settings</span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Preferences
            </h3>
            <button className="w-full text-left py-3 px-4 bg-white rounded-lg hover:bg-gray-100 transition-colors mb-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Notifications</span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
            <button className="w-full text-left py-3 px-4 bg-white rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Display</span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-4 px-6 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
