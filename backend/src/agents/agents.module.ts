import { Module } from '@nestjs/common';
import { AgentsService } from './agents/agents.service';

@Module({
  providers: [AgentsService]
})
export class AgentsModule {}
