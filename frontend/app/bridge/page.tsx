"use client";

import { BridgeInterface } from "@/components/BridgeInterface";

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Cross-Chain Bridge</h1>
          <p className="text-gray-400 text-lg">
            Move USDC between chains to access different investment strategies
          </p>
        </div>

        <BridgeInterface />
      </div>
    </div>
  );
}
