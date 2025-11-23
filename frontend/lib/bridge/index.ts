// Bridge hooks
export {
  useBridgeTransfer,
  useBridgeEstimates,
  useBridgeInfo,
  useBridgeHealth,
} from './hooks';
export type { UseBridgeTransferResult } from './hooks';

// Bridge API
export {
  bridgeTransfer,
  getBridgeEstimate,
  getBridgeInfo,
  checkBridgeHealth,
  bridgeDemo,
} from './bridge-api';
export type {
  BridgeTransferRequest,
  BridgeTransferResponse,
  BridgeEstimate,
  BridgeInfo,
} from './bridge-api';

// Chain configuration
export {
  SUPPORTED_CHAINS,
  getChainById,
  getUSDCAddress,
  getVaultInfo,
  isSupportedChain,
  getChainName,
  RISK_LEVEL_COLORS,
  arcChain,
  celoChain,
  worldChain,
} from './chains.config';
export type { SupportedChainId } from './chains.config';
