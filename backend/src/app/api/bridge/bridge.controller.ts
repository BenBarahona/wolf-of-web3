/**
 * Bridge Controller
 * API endpoints for Circle Bridge Kit integration
 */

import { Controller, Post, Get, Body, Logger } from '@nestjs/common';
import { BridgeService, BridgeTransferRequest } from '../../../services/bridge/bridge.service';

@Controller('api/bridge')
export class BridgeController {
  private readonly logger = new Logger(BridgeController.name);

  constructor(private readonly bridgeService: BridgeService) {}

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
}

