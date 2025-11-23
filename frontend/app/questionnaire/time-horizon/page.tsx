"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const timeOptions = [
  { id: "less_than_day", label: "Less than a day", icon: "" },
  { id: "less_than_week", label: "Less than a week", icon: "" },
  { id: "up_to_month", label: "Up to a month", icon: "" },
  { id: "more_than_year", label: "More than a year", icon: "" },
];

export default function TimeHorizonPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedOption) {
      alert("Please select a time horizon");
      return;
    }

    sessionStorage.setItem("timeHorizon", selectedOption);

    router.push("/questionnaire/risk");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-bold mb-2 text-black">
          How long do you plan to invest for?
        </h1>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-600 rounded-full" />
          <div className="h-1 flex-1 bg-blue-200 rounded-full" />
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {timeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
