/**
 * Bridge Controller
 * API endpoints for Circle Bridge Kit integration
 */

import { Controller, Post, Get, Body, Logger, Query } from '@nestjs/common';
import { BridgeService, BridgeTransferRequest } from '../../../services/bridge/bridge.service';
import { CCTPV2Service, CCTPV2BridgeRequest } from '../../../services/bridge/cctp-v2.service';
import { GatewayService } from '../../../services/bridge/gateway.service';

@Controller('api/bridge')
export class BridgeController {
  private readonly logger = new Logger(BridgeController.name);

  constructor(
    private readonly bridgeService: BridgeService,
    private readonly cctpV2Service: CCTPV2Service,
    private readonly gatewayService: GatewayService,
  ) {}

  @Post('transfer')
  async bridgeTransfer(@Body() request: BridgeTransferRequest) {
    this.logger.log(`Bridge transfer request: ${JSON.stringify(request)}`);
    return this.bridgeService.bridgeUSDC(request);
  }

  /**
   * POST /api/bridge/demo
   * Demo endpoint - bridges a small amount to demonstrate Bridge Kit
   */
  @Post('demo')
  async bridgeDemo() {
    this.logger.log('Bridge demo requested');
    return this.bridgeService.bridgeDemo();
  }

  /**
   * GET /api/bridge/info
   * Get bridge wallet and configuration info
   */
  @Get('info')
  async getBridgeInfo() {
    return {
      wallet: this.bridgeService.getBridgeWalletInfo(),
      chains: this.bridgeService.getSupportedChains(),
      status: 'operational',
      technology: 'Circle Bridge Kit + CCTP',
    };
  }

  @Post('estimate')
  async estimateBridge(
    @Body() request: { fromChain: string; toChain: string; amount: string },
  ) {
    return this.bridgeService.estimateBridge(request.fromChain, request.toChain, request.amount);
  }

  @Get('health')
  async healthCheck() {
    const walletInfo = this.bridgeService.getBridgeWalletInfo();
    return {
      status: walletInfo.isConfigured ? 'healthy' : 'not_configured',
      service: 'Circle Bridge Kit',
      wallet: walletInfo,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * CCTP V2 ENDPOINTS
   * Direct integration with CCTP V2 for Arc Testnet support
   */

  @Post('cctp-v2/transfer')
  async cctpV2Transfer(@Body() request: CCTPV2BridgeRequest) {
    this.logger.log(`CCTP V2 transfer request: ${JSON.stringify(request)}`);
    return this.cctpV2Service.bridgeUSDC(request);
  }

  @Get('cctp-v2/chains')
  async getCCTPV2Chains() {
    return this.cctpV2Service.getSupportedChains();
  }

  @Get('cctp-v2/info')
  async getCCTPV2Info() {
    return {
      wallet: this.cctpV2Service.getBridgeWalletInfo(),
      chains: this.cctpV2Service.getSupportedChains(),
      status: 'operational',
      technology: 'Circle CCTP V2 (Direct Integration)',
      arcSupport: true,
    };
  }

  /**
   * CIRCLE GATEWAY ENDPOINTS
   * Unified crosschain USDC balance management
   */

  @Get('gateway/info')
  async getGatewayInfo() {
    this.logger.log('Gateway info requested');
    return this.gatewayService.getInfo();
  }

  @Get('gateway/balance')
  async getGatewayBalance(@Query('address') address: string) {
    if (!address) {
      return {
        success: false,
        message: 'Address parameter is required',
      };
    }

    this.logger.log(`Gateway balance requested for ${address}`);
    try {
      const summary = await this.gatewayService.getBalanceSummary(address);
      return {
        success: true,
        data: summary,
      };
    } catch (error: any) {
      this.logger.error('Error fetching gateway balance:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('gateway/domains')
  async getGatewayDomains() {
    return {
      success: true,
      domains: this.gatewayService.getSupportedDomains(),
    };
  }
}

