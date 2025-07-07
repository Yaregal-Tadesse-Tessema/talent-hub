import { HttpModule } from '@nestjs/axios';
import { AfroMessageService } from './afro-message.service';
import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { AfroMEssageController } from './afro-message.controller';
dotenv.config({ path: '.env' });
@Module({
  imports: [HttpModule],
  providers: [AfroMessageService],
  controllers: [AfroMEssageController],
  exports: [AfroMessageService],
})
export class SmsModule {}
