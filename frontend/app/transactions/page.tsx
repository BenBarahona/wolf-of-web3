"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCircle, useTransactions, Transaction } from "@/lib/circle";
import BottomNav from "@/components/BottomNav";

export default function Transactions() {
  const router = useRouter();
  const { userSession, isInitialized } = useCircle();
  const { getTransactions } = useTransactions();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!userSession) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        const txs = await getTransactions(100);
        setTransactions(txs);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) {
      loadTransactions();
    }
  }, [isInitialized, userSession, getTransactions, router]);

  const getTransactionIcon = (type: string) => {
    if (type === "vault_deposit") {
      return (
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      );
    } else if (type === "vault_withdraw") {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </div>
      );
    } else if (type === "token_approve") {
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </div>
    );
  };

  const getTransactionLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      vault_deposit: "Vault Deposit",
      vault_withdraw: "Vault Withdrawal",
      token_approve: "Token Approval",
      contract_interaction: "Contract Interaction",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    if (status === "confirmed") return "text-green-600 bg-green-50";
    if (status === "failed") return "text-red-600 bg-red-50";
    return "text-yellow-600 bg-yellow-50";
  };

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-900"
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

        {transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Transactions Yet
            </h2>
            <p className="text-gray-500">
              Your transaction history will appear here once you start using the
              app.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  {getTransactionIcon(tx.transactionType)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {getTransactionLabel(tx.transactionType)}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    {tx.amount && (
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        {tx.amount} {tx.tokenSymbol || ""}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-gray-400 truncate">
                      {tx.transactionHash}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
