"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const riskOptions = [
  { id: "low", label: "Low Risk", icon: "" },
  { id: "medium", label: "Medium Risk", icon: "" },
  { id: "high", label: "High Risk", icon: "" },
];

export default function RiskPreferencePage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedOption) {
      alert("Please select a risk preference");
      return;
    }

    sessionStorage.setItem("riskPreference", selectedOption);

    router.push("/questionnaire/strategy");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-bold mb-2 text-black">
          What&apos;s your risk preference?
        </h1>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {riskOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full p-6 rounded-2xl border-2 transition-all ${
                selectedOption === option.id
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-black hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="font-semibold">{option.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tagline */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-8">
          <p className="text-sm text-gray-600 text-center italic">
            We can hunt safely, or chase bigger prey. You decide.
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedOption}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
