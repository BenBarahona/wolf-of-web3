import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('agent')
export class AgentController {
  @Get('health')
  health() {
    return { ok: true, service: 'agent' };
  }

  @Post('strategy')
  proposeStrategy(@Body() body: any) {
    return {
      strategies: [
        { id: 'stable-yield', risk: 'low' },
        { id: 'blue-chips', risk: 'medium' },
        { id: 'momentum', risk: 'high' },
      ],
      input: body,
    };
  }
}
