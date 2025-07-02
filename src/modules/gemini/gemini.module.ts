/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from './services/gemini';
import { ResumeMatchingService } from './services/resume-matcher';
import { GeminiController } from './controller/gemini.controller';
import { PdfParserController } from './controller/pdf-parser.controller';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [GeminiService, ResumeMatchingService],
  controllers: [GeminiController, PdfParserController],
  exports: [GeminiService, ResumeMatchingService],
})
export class GeminiModule {}
