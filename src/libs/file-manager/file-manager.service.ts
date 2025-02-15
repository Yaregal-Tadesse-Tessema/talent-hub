/* eslint-disable prettier/prettier */
import { Response } from 'express';
import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { FileResponseDto } from './dtos/file-response.dto';
import * as fs from 'fs';
import 'multer';
import { FileDto } from '../Common/dtos/file.dto';
@Injectable()
export class FileManagerService {
  private storage: Storage;
  private bucketName: string;
  constructor(
    // private readonly configService: ConfigService
  ) {
    this.bucketName = 'talent-hub';
  }
  async downloadFile(
    file: FileResponseDto,
    basePath: string,
    response: Response,
    deleteAfterCompleted = false,
  ): Promise<StreamableFile> {
    // const downloadPath = await this.sftpClient.download(
    //   `${basePath}/${file.filename}`,
    //   file.path
    // );
    const downloadPath = `${basePath}/${file.filename}`;
    const readStream = createReadStream(downloadPath.toString());
    if (deleteAfterCompleted) {
      response.on('finish', async function () {
        readStream.destroy();
        fs.access(downloadPath, (err) => {
          if (!err) {
            fs.unlink(downloadPath, () => {
              // console.log(err);
            });
          }
        });
        // console.log('the response has been sent');
      });
    }
    return new StreamableFile(readStream);
  }
  async uploadFile(
    file: Express.Multer.File,
    basePath: string,
  ): Promise<FileResponseDto> {
    return await this.uploadToRemoteFileServer(file, basePath);
  }
  async uploadFiles(
    files: Express.Multer.File[],
    basePath: string,
  ): Promise<FileResponseDto[]> {
    const responses: FileResponseDto[] = [];

    files.forEach(async (file) => {
      const response = await this.uploadToRemoteFileServer(file, basePath);
      responses.push(response);
    });

    return responses;
  }

  private async uploadToRemoteFileServer(
    file: Express.Multer.File,
    basePath: string,
  ): Promise<FileResponseDto> {
    return new FileResponseDto(
      file.filename,
      file.path,
      file.originalname,
      file.mimetype,
      file.size,
    );
  }
  async removeFile(file: FileResponseDto, basePath: string) {
    const filePath = `${basePath}/${file.filename}`;
    if (fs.existsSync(filePath)) {
      fs.access(filePath, (err) => {
        if (!err) {
          fs.unlink(filePath, () => {
            // console.log(err);
          });
        }
      });
    }
  }
  async uploadBucketFile(
    file: Express.Multer.File,
    fileId: string,
  ): Promise<FileDto> {
    // const fileName = file.originalname;
    const fileName = fileId;
    const mimetype = file.mimetype;
    const origionalName = file.originalname;
    const size = file.size;

    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: true,
      contentType: file.mimetype,
    });

    const res = await new Promise<string>((resolve, reject) => {
      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${blob.name}`;
        resolve(publicUrl);
      });

      blobStream.on('error', (err) => {
        reject(`Unable to upload file: ${err.message}`);
      });

      blobStream.end(file.buffer);
    });
    const response: FileDto = {
      filename: fileId,
      mimetype: mimetype,
      originalname: origionalName,
      path: res,
      bucketName: this.bucketName,
      size: size,
    };
    return response;
  }
  async deleteBucketFile(fileId: string): Promise<boolean> {
    // const fileName = file.originalname;
    const fileName = fileId;
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);

    try {
      await blob.delete();
      return true;
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
      return false;
    }
  }
  async getFile(fileName: string): Promise<any> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    const exists = await file.exists();
    if (!exists[0]) {
      throw new NotFoundException(`File ${fileName} does not exist.`);
    }

    // Create a read stream from the file in GCS
    return file.createReadStream();
  }
}
