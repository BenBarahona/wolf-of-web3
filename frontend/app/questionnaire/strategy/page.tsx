"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const strategies = [
  {
    id: "low_risk",
    name: "Low-Risk Strategy",
    description: "Stable yield with USDC and low-volatility assets",
    icon: "📈",
  },
  {
    id: "balanced",
    name: "Balanced Strategy",
    description: "Mixed portfolio with BTC, ETH and stable digital assets",
    icon: "⚖️",
  },
  {
    id: "high_growth",
    name: "High-Growth Strategy",
    description: "Momentum, narrative-driven and higher risk opportunities",
    icon: "📈",
  },
  {
    id: "wolf_recommendation",
    name: "Wolf Recommendation",
    description: "Choose wisely... or I can recommend one.",
    icon: "🐺",
  },
];

export default function StrategySelectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  useEffect(() => {
    // Simulate AI processing
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = async () => {
    if (!selectedStrategy) {
      alert("Please select a strategy");
      return;
    }

    const investmentPreferences = JSON.parse(
      sessionStorage.getItem("investmentPreferences") || "[]"
    );
    const timeHorizon = sessionStorage.getItem("timeHorizon");
    const riskPreference = sessionStorage.getItem("riskPreference");

    sessionStorage.setItem("selectedStrategy", selectedStrategy);

    const allPreferences = {
      investmentPreferences,
      timeHorizon,
      riskPreference,
      selectedStrategy,
    };
    sessionStorage.setItem(
      "onboardingPreferences",
      JSON.stringify(allPreferences)
    );

    // Wallet is already created during signup, go directly to dashboard
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center px-6">
        {/* Wolf Character */}
        <div className="relative w-48 h-48 mb-8">
          <Image
            src="/images/wolf-thinking.png"
            alt="Wolf thinking"
            fill
            className="object-contain animate-pulse"
            priority
          />
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-black mb-2">Let me think...</h2>
        <p className="text-gray-600 text-center">
          I&apos;m creating 3 strategies for you to choose
        </p>

        {/* Loading Dots */}
        <div className="flex gap-2 mt-6">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-black">
          Your personalized investment strategies.
        </h1>

        {/* Strategy Options */}
        <div className="space-y-3 mb-8">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                selectedStrategy === strategy.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-black hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">{strategy.icon}</span>
                <div className="flex-1">
                  <div className="font-bold mb-1">{strategy.name}</div>
                  <div
                    className={`text-sm ${
                      selectedStrategy === strategy.id
                        ? "text-blue-100"
                        : "text-gray-600"
                    }`}
                  >
                    {strategy.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedStrategy}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
