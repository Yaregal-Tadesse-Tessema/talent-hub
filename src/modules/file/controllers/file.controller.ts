/* eslint-disable prettier/prettier */
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from '../services/file.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('files')
@ApiTags('Files')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Post('upload-file/:fileId')
  @UseInterceptors(FileInterceptor('file')) 
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Param('fileId') fileId: string,
  ) {
    return await this.fileService.uploadAttachment(fileId,file);
  }

  @Get('/:fileId')
  async getFileByCategory(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const { file, contentType } =
      await this.fileService.getFile(fileId);
    res.setHeader('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600, immutable'); //cache files for 1 hour by default 1*60*60=3600
    return file.pipe(res);
  }

  @Get('get-file/:applicationId')
  @ApiConsumes('multipart/form-data')
  async getFile(
    @Param('fileId') fileId: string,
  ) {
    return await this.fileService.getFile(fileId);
  }
  @Delete('delete-file/:fileId')
  async deleteAttachment(@Param('fileId') fileId: string) {
    return await this.fileService.deleteBucketFile(fileId);
  }
  @Post('merge')
  @UseInterceptors(FilesInterceptor('files'))
  async mergeFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.fileService.mergeFiles(files);
  }
}
