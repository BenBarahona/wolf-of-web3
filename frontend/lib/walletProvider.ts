// src/lib/walletProvider.ts
export type WalletProvider = "worldcoin" | "celo";

export const WALLET_PROVIDER: WalletProvider =
  (process.env.NEXT_PUBLIC_WALLET_PROVIDER as WalletProvider) || "worldcoin";

export const isCeloProvider = WALLET_PROVIDER === "celo";
export const isWorldcoinProvider = WALLET_PROVIDER === "worldcoin";
