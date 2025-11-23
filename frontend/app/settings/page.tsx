"use client";

import { useRouter } from "next/navigation";
import { useCircle } from "@/lib/circle";
import BottomNav from "@/components/BottomNav";

export default function Settings() {
  const router = useRouter();
  const { clearSession } = useCircle();

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
