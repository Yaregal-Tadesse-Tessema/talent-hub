/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FileDto } from '../dtos/command/fileUploadDto';
import * as Minio from 'minio';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as sharp from 'sharp';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import * as fas from 'fs';
import * as util from 'util';
import * as libreConvert from 'libreoffice-convert';
import { promisify } from 'node:util';
dotenv.config({ path: '.env' });
import * as docxConverter from 'docx-pdf';
const convert = promisify(docxConverter);
@Injectable()
export class FileService {
  private readonly bucketName: string;
  private readonly minioClient: Minio.Client;
  private storage: Storage;
  private readonly convertAsync = util.promisify(libreConvert.convert);
  constructor() {
    this.bucketName = process.env.MINIO_BUCKET_NAME;
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_HOST,
      port: +process.env.MINIO_PORT,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }
  async uploadAttachment(
    fileId: string,
    file: Express.Multer.File,
  ): Promise<FileDto> {
    try {
      const metaData = {
        'Content-Type': file.mimetype,
      };
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${this.bucketName}/*`, // Correct ARN format
          },
        ],
      };
      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy),
      );

      // Upload the file to Minio
      const resultData = await this.minioClient.putObject(
        this.bucketName,
        fileId,
        file.buffer,
        file.size,
        metaData,
      );

      // If upload fails, throw an error
      if (!resultData) throw new HttpException('File upload failed', 500);
      // Set the file to be publicly accessible
      // Generate the public URL to access the file
      const publicUrl = `http://${process.env.MINIO_HOST}:9000/${this.bucketName}/${fileId}`;
      // Prepare the response DTO
      const response: FileDto = {
        filename: fileId,
        mimetype: file.mimetype,
        originalname: file.originalname,
        path: publicUrl, // Use public URL here
        bucketName: this.bucketName,
        size: file.size,
      };

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteBucketFile(fileId: string): Promise<boolean> {
    const fileName = fileId;
    try {
      // Delete the file from the Minio bucket
      await this.minioClient.removeObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
      return false;
    }
  }
  async uploadFile(
    { userId, fileCategory, metaData: meta },
    file: Express.Multer.File,
  ) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

      let fileId = `${userId}/${fileCategory}/${uniqueSuffix}`;
      if (file.originalname) {
        fileId += `_${file.originalname}`;
      }
      const metaData = {
        'Content-Type': file?.mimetype,
        ...meta,
      };
      const resultData = await this.minioClient.putObject(
        this.bucketName,
        fileId,
        file.buffer,
        file.size,
        metaData,
      );
      if (!resultData) throw new HttpException('file upload failed', 500);

      return { fileId };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getFile(fileName: string): Promise<any> {
    try {
      // Retrieve the file as a stream from Minio
      const fileStream = await this.minioClient.getObject(
        this.bucketName,
        fileName,
      );

      // Check if the file exists by attempting to fetch it
      const fileExists = fileStream !== null;
      if (!fileExists) {
        throw new NotFoundException(`File ${fileName} does not exist.`);
      }

      // Return the file stream
      return fileStream;
    } catch (error) {
      console.error(`Error fetching file ${fileName}:`, error);
      throw new NotFoundException(
        `File ${fileName} not found or could not be retrieved.`,
      );
    }
  }

  async isFileExist(fileName: string, option = {}) {
    return await this.minioClient
      .statObject(this.bucketName, fileName, option)
      .catch(() => {
        throw new NotFoundException('File not found');
      });
  }
  async uploadRawFile(
    destinationPath: string,
    filePath: string,
    fileName: string,
    metadata = {},
  ) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileId = `${destinationPath}/${uniqueSuffix}_${fileName}`;

      const result = await this.minioClient
        .fPutObject(
          this.bucketName,
          fileId,
          `${filePath}/${fileName}`,
          metadata,
        )
        .catch((e) => {
          console.error(e);
          throw new Error('Error processing file upload');
        });
      return { result, fileId };
    } catch (error) {
      console.error('Error:', error);
      // return 'Error processing file upload';
      throw new Error('Error processing file upload');
    }
  }
  //Upload multiple files and return their locations
  async uploadMultipleFiles(
    files: {
      file: Express.Multer.File;
      metaData: object | undefined;
    }[],
    category: string,
    id: string,
  ) {
    const fileData: { fileId: string; mimeType: string }[] = [];
    //TODO: replace with promise.all
    for (const file of files) {
      if (file) {
        const { fileId: uploadedFileId } = await this.uploadFile(
          {
            fileCategory: category,
            userId: id,
            metaData: file.metaData,
          },
          file.file,
        );
        fileData.push({
          fileId: uploadedFileId,
          mimeType: file.file.mimetype,
        });
      }
    }
    return fileData;
  }
  async mergeFiles(files: Express.Multer.File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      if (file.mimetype === 'application/pdf') {
        const pdfDoc = await PDFDocument.load(file.buffer);
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices(),
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      } else {
        const imageBuffer = await sharp(file.buffer)
          .resize(800, 600, { fit: 'inside' })
          .png()
          .toBuffer();

        const image = await mergedPdf.embedPng(imageBuffer);
        const page = mergedPdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0 });
      }
    }
    const pdfBytes = await mergedPdf.save();
    return pdfBytes;
  }

  async mergeLocalFiles(files: string[]) {
    for (const file of files) {
      const stat = await fs.stat(file);
      if (!stat.isFile())
        throw new InternalServerErrorException(`File ${file} not found`);
    }
    const mergedPdf = await PDFDocument.create();
    for (const f of files) {
      const file = await fs.readFile(f);
      if (path.extname(f) === '.pdf') {
        const pdfDoc = await PDFDocument.load(file);
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices(),
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      } else {
        const imageBuffer = await sharp(file)
          .resize(800, 600, { fit: 'inside' })
          .png()
          .toBuffer();

        const image = await mergedPdf.embedPng(imageBuffer);
        const page = mergedPdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0 });
      }
    }
    const buffer = await mergedPdf.save();

    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = `${uniqueSuffix}.pdf`;
      const tmpDir = os.tmpdir();
      const separator = path.sep;

      const targetPath = await fs.mkdtemp(`${tmpDir}${separator}`);

      await fs.writeFile(`/${targetPath}/${fileName}`, buffer);
      return {
        fullFileLocation: `${targetPath}/${fileName}`,
        fileName,
        fileDirectory: targetPath,
      };
    } catch (err) {
      console.error(err);
      throw new Error('Error processing file upload');
    }
  }
  async enforceA4Size(pdfBuffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const A4_WIDTH = 595.28; // A4 width in points
    const A4_HEIGHT = 841.89; // A4 height in points

    pdfDoc.getPages().forEach((page) => {
      page.setSize(A4_WIDTH, A4_HEIGHT);
    });

    return Buffer.from(await pdfDoc.save());
  }
  async convertWordToPdf(
    file: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.doc', '.docx'].includes(ext)) {
      throw new BadRequestException('Only DOC and DOCX files are supported.');
    }

    try {
      // Create temporary file paths
      const inputPath = path.join(__dirname, `temp-${Date.now()}.docx`);
      const outputPath = inputPath.replace(/\.docx?$/, '.pdf');

      // Save the uploaded file temporarily
      fas.writeFileSync(inputPath, file.buffer);

      // Convert DOCX to PDF
      await convert(inputPath, outputPath);

      // Read the converted PDF
      const pdfBuffer = fas.readFileSync(outputPath);
      const modifiedPdfBuffer = await this.enforceA4Size(pdfBuffer);
      // Clean up temporary files
      fas.unlinkSync(inputPath);
      fas.unlinkSync(outputPath);

      // Return the PDF file in Multer format
      return {
        ...file,
        originalname: file.originalname.replace(/\.(doc|docx)$/, '.pdf'),
        mimetype: 'application/pdf',
        buffer: modifiedPdfBuffer,
        size: modifiedPdfBuffer.length,
      };
    } catch (error) {
      throw new BadRequestException(`Conversion failed: ${error.message}`);
    }
  }
}
