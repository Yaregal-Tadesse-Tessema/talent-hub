/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { UserEntity } from '../persistence/users.entity';
import { FileService } from 'src/modules/file/services/file.service';
import { UserResponse } from './user.response';
import * as path from 'path';
import { PdfService } from 'src/libs/pdf/pdf.service';
import { CvTemplateEnums } from './user.command';
import { exec } from 'child_process';
import * as fs from 'fs-extra';
import * as tmp from 'tmp';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { AccountPasswordChange } from 'src/modules/account/dtos/command.dto/account.dto';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
import { JwtService } from '@nestjs/jwt';
import { UserStatusEnums } from '../constants';
import { Response } from 'express';
@Injectable()
export class UserService extends CommonCrudService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly fileService: FileService,
    private readonly pdfService: PdfService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {
    super(userRepository);
  }
  async getProfileCompleteness(id: string): Promise<{ percentage: number }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return { percentage: 0 };
    }
    // Define fields and their weights
    const fieldsWithWeights = [
      { key: 'phone', weight: 20 },
      { key: 'email', weight: 20 },
      { key: 'firstName', weight: 20 },
      { key: 'lastName', weight: 20 },
      { key: 'highestLevelOfEducation', weight: 20 },
      { key: 'industry', weight: 20 },
      { key: 'yearOfExperience', weight: 15 },
      { key: 'preferredJobLocation', weight: 15 },
      { key: 'gpa', weight: 15 },
      { key: 'salaryExpectations', weight: 15 },
      { key: 'linkedinUrl', weight: 10 },
      { key: 'portfolioUrl', weight: 10 },
      { key: 'aiGeneratedJobFitScore', weight: 10 },
      { key: 'birthDate', weight: 10 },
      { key: 'middleName', weight: 5 },
      { key: 'gender', weight: 5 },
      { key: 'profile', weight: 5 },
    ];

    // Calculate total score
    let filledScore = 0;
    let totalWeight = 0;

    for (const field of fieldsWithWeights) {
      totalWeight += field.weight;
      if (
        user[field.key] &&
        (Array.isArray(user[field.key]) ? user[field.key].length > 0 : true)
      ) {
        filledScore += field.weight;
      }
    }

    // Calculate percentage
    const percentage = Math.round((filledScore / totalWeight) * 100);

    return { percentage };
  }
  async uploadResumeByUserId(file: Express.Multer.File, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new BadRequestException(`User with id ${userId} doesn't exist`);
    if (user?.resume) {
      const resumeAlreadyUsed = await this.applicationRepository.findOne({
        where: { cv: { filename: user.resume.filename } },
      });
      if (!resumeAlreadyUsed) {
        await this.fileService.deleteBucketFile(user.resume.filename);
      }
    }

    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);

    // const comman = { userId, fileCategory: 'Resume', metaData: { fileName } };
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext == '.doc' || ext == '.docx') {
      // file = await this.fileService.convertWordToPdf(file);
      // const res = await this.fileService.uploadAttachment(fileId, filed);
    }
    const fileName = file.originalname.replace(/\s/g, '_');
    const fileId = `${userId}/resume/${randomNumber}_${fileName}`;
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    user.resume = res;
    const response = await this.userRepository.save(user);
    return UserResponse.toResponse(response);
  }
  async uploadProfile(file: Express.Multer.File, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new BadRequestException(`User with id ${userId} doesn't exist`);
    if (user.profile) {
      await this.fileService.deleteBucketFile(user.profile.filename);
    }
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${userId}/Profile/${randomNumber}_${fileName}`;
    // const comman = { userId, fileCategory: 'Resume', metaData: { fileName } };
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    user.profile = res;
    const response = await this.userRepository.save(user);
    return UserResponse.toResponse(response);
  }
  async uploadResume(file: Express.Multer.File, telegramUserId: string) {
    const user = await this.userRepository.findOne({
      where: { telegramUserId: telegramUserId },
    });
    if (!user)
      throw new BadRequestException(
        `User with id ${telegramUserId} doesn't exist`,
      );

    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${user.id}/Resume/${randomNumber}_${fileName}`;
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    user.resume = res;
    const response = await this.userRepository.save(user);
    return UserResponse.toResponse(response);
  }
  // async convertWordToPdf(file: Express.Multer.File) {
  //   const res = await this.fileService.convertWordToPdf(file);
  //   if (!res) throw new BadRequestException('file upload failed');
  //   return res;
  // }
  async generateCv(template: CvTemplateEnums, command: any) {
    try {
      const pdfContext = command;
      const templateName =
        template == CvTemplateEnums.EuroPass ? 'cv-one' : 'cv-two';
      const fileName = `my_cv`;
      const query = { landscape: 'true' };
      const Options = {
        format: 'A4',
        landscape:
          query && query.landscape && query.landscape === 'true' ? true : false,
        displayHeaderFooter: query ? true : false,
        margin: {
          top: '10px',
          bottom: '10px',
          right: '20px',
          left: '20px',
        },
      };
      const pdfPath = await this.pdfService.generatePdf(
        pdfContext,
        templateName,
        fileName,
        Options,
        null,
      );
      return pdfPath;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async convertWordToPdf(
    wordBuffer: Buffer,
    fileName: string,
  ): Promise<Buffer> {
    const tempDir = tmp.dirSync({ unsafeCleanup: true });
    const inputPath = path.join(tempDir.name, fileName);
    const outputPath = path.join(
      tempDir.name,
      fileName.replace(/\.[^/.]+$/, '.pdf'),
    );

    try {
      // Save Word file to temp dir
      await fs.writeFile(inputPath, wordBuffer);

      // Convert using LibreOffice
      await this.runLibreOffice(inputPath, tempDir.name);

      // Wait for the PDF to be generated
      if (!fs.existsSync(outputPath)) {
        throw new Error('PDF conversion failed, file not created');
      }

      const pdfBuffer = await fs.readFile(outputPath);
      return pdfBuffer;
    } catch (err) {
      console.error('Conversion error:', err);
      throw new InternalServerErrorException('Failed to convert Word to PDF');
    } finally {
      tempDir.removeCallback(); // Clean up temp files
    }
  }
  async changePassword(command: AccountPasswordChange) {
    const user = await this.userRepository.findOne({
      where: { id: command.id },
    });
    if (!user)
      throw new NotFoundException(
        `Account with id ${command.id} doesn't exist`,
      );
    if (user.password != command.oldPassword)
      throw new BadRequestException(`Invalid Old Password`);
    user.password = command.newPassword;
    await this.userRepository.save(user);
    return true;
  }
  async sendActivationMessage(
    to: string,
    userFullName: string,
    token: string,
  ): Promise<boolean> {
    const activationLink = `http://138.197.105.31:3010/api/users/activate-account?token=${token}`;
    const subject = 'Activate Your Account 🚀';

    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hello ${userFullName},</h2>
      <p>Thank you for registering with us! To complete your registration and activate your account, please click the button below:</p>
      <a href="${activationLink}"
         style="
           display: inline-block;
           padding: 12px 24px;
           margin: 20px 0;
           font-size: 16px;
           color: white;
           background-color: #007bff;
           text-decoration: none;
           border-radius: 6px;
         "
         target="_blank">
        Activate My Account
      </a>
      <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
      <p><a href="${activationLink}">${activationLink}</a></p>
      <p>This link will expire in 24 hours for your security.</p>
      <p>Welcome aboard!<br/>— The YourCompany Team</p>
    </div>
  `;

    await this.emailService.sendGridEmail(to, subject, html);
    return true;
  }
  async activateAccount(token: string, @Res() res: Response) {
    if (!token) {
      throw new BadRequestException('Activation token is required');
    }
    const payload = await this.jwtService.verify(token);
    if (!payload?.id) throw new NotFoundException(`user Id not Found`);
    const success = await this.userRepository.update(
      { id: payload.id },
      { status: UserStatusEnums.ACTIVE },
    );

    if (success) {
      return res.redirect('/activation-success'); // frontend success page
    } else {
      return res.redirect('/activation-failed'); // frontend error page
    }
  }
  private runLibreOffice(inputPath: string, outputDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('LibreOffice error:', stderr || error.message);
          return reject(error);
        }
        resolve();
      });
    });
  }
}
