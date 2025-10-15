import { Controller, Post, Get, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GroqService } from '../usecase/groq.service';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('groq')
@AllowAnonymous()
@ApiTags('groq')
export class GroqController {
  constructor(private readonly groqService: GroqService) {}

  /**
   * Endpoint to extract CV info from a PDF file.
   * Expects a multipart/form-data request with a file field named 'file'.
   */
  @Post('extract-cv-info')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.match(
            /\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/,
          )
        ) {
          return cb(
            new BadRequestException('Only PDF and Word documents are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async extractCvInfoFromPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded or file is invalid');
    }
    
    return await this.groqService.extractCvInfoFromPdf(file.buffer);
  }

  /**
   * Endpoint to scrape job postings from Ethiopian Reporter Jobs
   * Returns an array of job postings in a structured format
   */
  @Get('scrape-ethiopian-reporter-jobs')
  @ApiOperation({ summary: 'Scrape job postings from Ethiopian Reporter Jobs website' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully scraped job postings',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tenantName: { type: 'string' },
          tenantAddress: { type: 'string' },
          tenantPhone: { type: 'string', nullable: true },
          jobType: { type: 'string' },
          worktype: { type: 'string' },
          jobTitle: { type: 'string' },
          experienceLevel: { type: 'string' },
          jobRequirement: { type: 'array', items: { type: 'string' } },
          responsibilities: { type: 'array', items: { type: 'string' } },
          howToApply: { type: 'string' },
          email: { type: 'string', nullable: true },
          skills: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          position: { type: 'string' },
          industry: { type: 'string' },
          deadline: { type: 'string' },
          gender: { type: 'string' },
          numberOfPosition: { type: 'number' },
          requiredYearOfExperience: { type: 'number' },
          isAdminCreated: { type: 'boolean' },
          jobLink: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Failed to scrape job postings' })
  async scrapeEthiopianReporterJobs() {
    return await this.groqService.scrapeEthiopianReporterJobs();
  }

  /**
   * Debug endpoint to analyze the Ethiopian Reporter Jobs page structure
   * Use this to understand why scraping might fail
   */
  @Get('debug-ethiopian-reporter-page')
  @ApiOperation({ summary: 'Debug endpoint to analyze page structure' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns detailed page structure information for debugging'
  })
  async debugEthiopianReporterPage() {
    return await this.groqService.debugEthiopianReporterPage();
  }
  
}
