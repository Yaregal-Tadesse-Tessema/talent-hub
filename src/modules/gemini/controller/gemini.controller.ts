/* eslint-disable prettier/prettier */
// src/gemini/gemini.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GeminiService } from '../services/gemini';

@Controller('gemini')
@ApiTags('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('ask')
  async askGemini(@Query('q') question: string) {
    const answer = await this.geminiService.ask(question);
    return { question, answer };
  }
}
