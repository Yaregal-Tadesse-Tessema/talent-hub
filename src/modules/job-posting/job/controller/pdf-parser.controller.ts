/* eslint-disable prettier/prettier */
// src/gemini/gemini.controller.ts

import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeMatchingService } from '../usecase/resume-matcher';

@Controller('pdf-parser')
@ApiTags('pdf-parser')
export class PdfParserController {
  constructor(private readonly resumeMatchingService: ResumeMatchingService) {}

  @Post('parse')
   @UseInterceptors(FileInterceptor('file')) 
  async askGemini(@UploadedFile() file: Express.Multer.File,) {
    const answer = await this.resumeMatchingService.extractTextFromPDF(file.buffer);
    return answer
  }
  @Post('match')
  @UseInterceptors(FileInterceptor('file')) 
  async matchResumes(
    @UploadedFile() file: Express.Multer.File,
    @Body('jobDescription') jobDescription: string,
    @Body('useAI') useAI?: string,
  ) {
     const filesdate: Express.Multer.File[]=[]
     filesdate.push(file)
    const result = await this.resumeMatchingService.matchResumes(
      filesdate,
      jobDescription,
      useAI !== 'false',
    );
    return result;
  }
  @Post('matchingWithAi')
  @UseInterceptors(FileInterceptor('file')) 
  async matchingWithAi(
    @UploadedFile() file: Express.Multer.File,
    @Body('jobDescription') jobDescription: string,
  ) {
    const result = await this.resumeMatchingService.matchingWithAi(
      file,
      jobDescription,
    );
    return result;
  }
}
