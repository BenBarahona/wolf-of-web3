"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const investmentOptions = [
  { id: "stablecoins", label: "Stablecoins", icon: "" },
  { id: "meme_coins", label: "Meme Coins", icon: "" },
  { id: "rwas", label: "RWAs", icon: "" },
  { id: "bitcoin", label: "Bitcoin", icon: "₿" },
  { id: "eth", label: "ETH", icon: "" },
  { id: "ai_tokens", label: "AI Tokens", icon: "" },
  { id: "yield_farming", label: "Yield Farming", icon: "" },
  { id: "blue_chips", label: "Blue Chips", icon: "" },
];

export default function InvestmentPreferencesPage() {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const handleNext = () => {
    if (selectedOptions.length === 0) {
      alert("Please select at least one investment preference");
      return;
    }

    sessionStorage.setItem(
      "investmentPreferences",
      JSON.stringify(selectedOptions)
    );

    router.push("/questionnaire/time-horizon");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-bold mb-2 text-black">
          What do you want to invest in?
        </h1>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-200 rounded-full" />
          <div className="h-1 flex-1 bg-blue-200 rounded-full" />
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {investmentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedOptions.includes(option.id)
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-black hover:border-blue-300"
              }`}
            >
              <div className="text-3xl mb-2">{option.icon}</div>
              <div className="font-semibold text-sm">{option.label}</div>
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={selectedOptions.length === 0}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
