import { Module } from '@nestjs/common';
import { GroqService } from './usecase/groq.service';
import { GroqController } from './controller/groq.controller';

@Module({
  controllers: [GroqController],
  providers: [GroqService],
  exports: [GroqService],
})
export class IntelligenceModule {}
