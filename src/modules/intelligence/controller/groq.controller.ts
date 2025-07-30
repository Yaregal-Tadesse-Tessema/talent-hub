import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GroqService } from '../usecase/groq.service';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';

@Controller('groq')
@AllowAnonymous()
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
  
}
