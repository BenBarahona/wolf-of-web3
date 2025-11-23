"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const onboardingSlides = [
  {
    image: "/images/wolf-office.png",
    title: "I tailor the strategy to your instincts.",
    description:
      "Show me what you care about, goals, risk, style, and I'll shape an investment path made for you.",
  },
  {
    image: "/images/wolf-trading.png",
    title: "I navigate the chains for you.",
    description:
      "Opportunities don't live on one chain, I move your capital across them, seamlessly.",
  },
  {
    image: "/images/wolf-safe.png",
    title: "Your money never leaves your hands.",
    description:
      "Your wallet, your keys, your ownership, I only guide, never take control.",
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Image */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="relative w-full max-w-[350px] aspect-square">
            <Image
              src={onboardingSlides[currentSlide].image}
              alt="Wolf character"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4 text-black">
            {onboardingSlides[currentSlide].title}
          </h1>
          <p className="text-gray-600 text-base px-4">
            {onboardingSlides[currentSlide].description}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {onboardingSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-blue-600 w-8" : "bg-blue-300 w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSignUp}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </button>
          <button
            onClick={handleLogin}
            className="w-full bg-white text-blue-600 py-4 rounded-xl font-semibold text-base border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Log In
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By login or register, you agree to our{" "}
          <a href="#" className="text-blue-600">
            Service Agreement
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600">
            Terms and Conditions
          </a>
        </p>
      </div>
    </div>
  );
}
