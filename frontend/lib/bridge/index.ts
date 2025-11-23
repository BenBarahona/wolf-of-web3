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
  ethereumSepoliaChain,
  baseSepoliaChain,
  worldChain,
} from './chains.config';
export type { SupportedChainId } from './chains.config';

// Gateway API - Unified Balance
export {
  getGatewayInfo,
  getUnifiedBalance,
  getSupportedDomains,
  formatUSDC,
  getChainColor,
  getChainIcon,
} from './gateway-api';
export type {
  GatewayBalanceSummary,
  GatewayDomain,
  GatewayInfo,
} from './gateway-api';
