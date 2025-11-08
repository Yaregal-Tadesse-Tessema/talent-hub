/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { UserResponse } from './user.response';
import * as path from 'path';
import {
  AccountPasswordChange,
  AccountPasswordReset,
  CreateUserCommand,
  CvTemplateEnums,
  SendPasswordResetLinkCommand,
  UpdateUserCommand,
  UserAlertConfiguration,
} from './user.command';
import { exec } from 'child_process';
import * as fs from 'fs-extra';
import * as tmp from 'tmp';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
import { JwtService } from '@nestjs/jwt';
import { UserStatusEnums } from '../constants';
import { Response } from 'express';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { ApplicationRepository } from 'src/modules/application/persistences/application.repository';
import { FileService } from 'src/modules/file/services/file.service';
import { Util } from 'src/libs/Common/util';
import { UserRepository } from '../persistence/user.repository';
import { UserInfo } from 'src/libs/Common/user-information';
import { UserEntity } from '../persistence/users.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionCommand } from 'src/modules/auth/services/session/session.usecase.command';
import { PasswordResetCommand } from 'src/modules/auth/services/password-reset/password-reset.usecase.service';
import { PasswordResetQuery } from 'src/modules/auth/services/password-reset/password-reset.usecase.query';
import { CreateLookupCommand } from 'src/modules/tenant/usecases/lookup/lookup.command';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { LookupRepository } from 'src/modules/tenant/persistencies/lookup.repository';
import { UserType } from 'src/modules/tenant/constants';
import { CreatePasswordResetCommand } from 'src/modules/auth/services/password-reset/password-reset.command';
import { LookupEntity } from 'src/modules/tenant/persistencies/lookup.entity';
import { AfroMessageService } from 'src/modules/sms/afro-message.service';
import { Command } from 'nestjs-telegraf';
import { randomUUID } from 'crypto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly userRepository: UserRepository,
    private readonly fileService: FileService,
    @Inject(forwardRef(() => ApplicationRepository))
    private readonly applicationRepository: ApplicationRepository,
    private readonly emailService: EmailService,
    private readonly afroMessageService: AfroMessageService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => SessionCommand))
    private readonly sessionCommand: SessionCommand,
    @Inject(forwardRef(() => PasswordResetCommand))
    private readonly passwordResetCommand: PasswordResetCommand,
    @Inject(forwardRef(() => PasswordResetQuery))
    private readonly passwordResetQuery: PasswordResetQuery,
    private readonly lookupRepository: LookupRepository,
  ) { }
  async getProfileCompleteness(id: string): Promise<{ percentage: number }> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      return { percentage: 0 };
    }
    // Define fields and their weights
    const fieldsWithWeights = [
      { key: 'phone', weight: 25 },
      { key: 'email', weight: 20 },
      { key: 'firstName', weight: 20 },
      { key: 'lastName', weight: 20 },
      { key: 'position', weight: 20 },
      { key: 'highestLevelOfEducation', weight: 20 },
      { key: 'industry', weight: 25 },
      { key: 'yearOfExperience', weight: 15 },
      { key: 'preferredJobLocation', weight: 15 },
      { key: 'gpa', weight: 15 },
      { key: 'salaryExpectations', weight: 20 },
      { key: 'linkedinUrl', weight: 5 },
      { key: 'portfolioUrl', weight: 5 },
      { key: 'aiGeneratedJobFitScore', weight: 10 },
      { key: 'birthDate', weight: 5 },
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
    const percentage = Math.round((filledScore / totalWeight) * 100);

    return { percentage };
  }
  async getEligibleUsersForTheJobPost(skills: string[]) {
    const skillsData = skills;
    const data = {
      technicalSkills: skillsData
    };
    const result = await this.userRepo
      .createQueryBuilder('userEntity')
      .where('userEntity.technicalSkills && :skills', { skills: skillsData })
      .andWhere('userEntity.status = :status', { status: UserStatusEnums.ACTIVE })
      .andWhere('userEntity.telegramUserId IS NOT NULL')
      .getMany();
    return result;
  }
  async uploadResumeByUserId(file: Express.Multer.File, userId: string) {
    const user = await this.userRepository.findOne(userId);
    if (!user)
      return null;
    if (user?.resume) {
      const resumeAlreadyUsed =
        await this.applicationRepository.getOneByCriteria({
          cv: { filename: user.resume.filename },
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
    const response = await this.userRepository.create(user);
    return UserResponse.toResponse(response);
  }
  async uploadProfile(file: Express.Multer.File, userId: string) {
    const user = await this.userRepository.findOne(userId);
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
    const response = await this.userRepository.create(user);
    return UserResponse.toResponse(response);
  }
  async uploadResume(file: Express.Multer.File, telegramUserId: string) {
    const user = await this.userRepository.getOneByCriteria({
      telegramUserId: telegramUserId,
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
    const response = await this.userRepository.create(user);
    return UserResponse.toResponse(response);
  }
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
      // const pdfPath = await this.pdfService.generatePdf(
      //   pdfContext,
      //   templateName,
      //   fileName,
      //   Options,
      //   null,
      // );
      return 'pdfPath';
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
    const user = await this.userRepository.findOne(command.id, ['lookup']);
    if (!user)
      throw new NotFoundException(
        `Account with id ${command.id} doesn't exist`,
      );
    const lookup = user.lookup;
    if (!lookup)
      throw new NotFoundException(
        `Lookup with id ${command.id} doesn't exist`,
      );
    if (lookup.password != command.oldPassword)
      throw new BadRequestException(`Incorrect Old Password`);
    lookup.password = command.newPassword;
    await this.lookupRepository.create(lookup);
    return true;
  }
  async sendActivationMessage(
    to: string,
    userFullName: string,
    token: string,
    userId: string,
  ): Promise<boolean> {
    const activationLink = `https://app.talent-hub.org/api/users/activate-account/${userId}?token=${token}`;
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

    await this.emailService.sendGridEmail(to, subject, html, userFullName);
    return true;
  }
  async activateAccount(token: string, @Res() res: Response, userId: string) {
    if (!token) {
      throw new BadRequestException('Activation token is required');
    }
    const payload = await this.jwtService.verify(token);
    if (!payload) {
      const user = await this.userRepository.findOne(userId);
      if (!user) throw new BadRequestException(`user Doesn't exist`);
      const uerInfo: UserInfo = {
        id: user.id,
        email: user?.email,
        firstName: user?.firstName,
        middleName: user?.middleName,
        lastName: user?.lastName,
      };
      const token = Util.GenerateToken(uerInfo);
      await this.sendActivationMessage(
        user.email,
        `${user.firstName} ${user.middleName} ${user.lastName}`,
        token,
        userId,
      );
      return res.redirect(`${process.env.UI_BASE_URL}/?status=activationSent`); // frontend error page indicating a new activation is sent
    }
    if (!payload?.id) throw new NotFoundException(`user Id not Found`);
    const user = await this.userRepository.findOne(payload.id);
    if (user.status == UserStatusEnums.ACTIVE) {
      return res.redirect(
        `${process.env.UI_BASE_URL}/login?status=alreadyActivated`,
      );
    }
    const success = await this.userRepository.update(payload.id, {
      status: UserStatusEnums.ACTIVE,
      tenantId: payload?.tenantId,
    });
    if (success) {
      return res.redirect(
        `${process.env.UI_BASE_URL}/login?status=successfullyActivated`,
      ); // frontend success page
    } else {
      return res.redirect(`${process.env.UI_BASE_URL}/status=failedToActivate`); // frontend error page
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
  async create(itemData: CreateUserCommand): Promise<any> {
    const command: any = {
      phone: itemData.phone,
      email: itemData.email,
    };
    const userAlreadyCreated = await this.userRepository.getOneByEmailORPhone(
      command,
      [],
    );
    const userAlreadyCreatedByGoogle = await this.lookupRepository.getOneByEmailORPhone(
      command,
      [],
    );
    if (userAlreadyCreated?.status == UserStatusEnums.ACTIVE || userAlreadyCreatedByGoogle) {
      const payload: UserInfo = {
        id: userAlreadyCreated.id,
        email: userAlreadyCreated?.email,
        firstName: userAlreadyCreated?.firstName,
        middleName: userAlreadyCreated?.middleName,
        lastName: userAlreadyCreated?.lastName,
        phoneNumber: userAlreadyCreated?.phone,
        profileImage: userAlreadyCreated?.profile,
        address: userAlreadyCreated?.address,
        skills: userAlreadyCreated?.technicalSkills,
        industry: userAlreadyCreated?.industry,
      };
      const accessToken = Util.GenerateToken(payload, '60m'); //60m
      const refreshToken = Util.GenerateRefreshToken(payload);
      await this.sessionCommand.createSession(
        {
          accountId: payload.id,
          token: accessToken,
          refreshToken,
        },
      );
      await this.userRepository.update(userAlreadyCreated.id, { lastLoginDate: new Date() });
      const data = {
        accessToken,
        refreshToken,
        profile: userAlreadyCreated,

      }
      return data
    }
    if (userAlreadyCreated?.status == UserStatusEnums.PENDING) {
      const uerInfo: UserInfo = {
        id: userAlreadyCreated.id,
        email: userAlreadyCreated?.email,
        firstName: userAlreadyCreated?.firstName,
        middleName: userAlreadyCreated?.middleName,
        lastName: userAlreadyCreated?.lastName,
      };
      const token = Util.GenerateToken(uerInfo);
      await this.sendActivationMessage(
        userAlreadyCreated.email,
        `${userAlreadyCreated.firstName} ${userAlreadyCreated.middleName} ${userAlreadyCreated.lastName}`,
        token,
        userAlreadyCreated.id,
      );
      throw new ConflictException({
        message:
          'Activation Link is Sent please check your inbox if you can not found check your spam folder',
        status: UserStatusEnums.PENDING,
      });
    }
    const password = Util.hashPassword(itemData.password ?? 'C0mplex');
    const item: UserEntity = await this.userRepository.create(itemData);
    const lookupCommand: CreateLookupCommand = {
      email: item.email,
      phoneNumber: item.phone,
      password: password,
      status: AccountStatusEnums.ACTIVE,
      firstName: item.firstName,
      middleName: item.middleName,
      lastName: item.lastName,
      userType: UserType.EMPLOYEE,
      userId: item.id,
    };
    const lookup = await this.lookupRepository.create(lookupCommand);
    const uerInfo: UserInfo = {
      id: item.id,
      email: item?.email,
      firstName: item?.firstName,
      middleName: item?.middleName,
      lastName: item?.lastName,
      lookupId: lookup.id,
    };
    const refreshToken = Util.GenerateRefreshToken(uerInfo);
    const token = Util.GenerateToken(uerInfo);
    if (item?.email) {
      await this.sendActivationMessage(
        item.email,
        `${item.firstName} ${item.middleName} ${item.lastName}`,
        token,
        item.id,
      );
    } else {
    }
    return {
      accessToken: token,
      refreshToken: refreshToken,
      profile: item,
    };
  }
  async save(itemData: UpdateUserCommand): Promise<UserResponse> {
    const item = this.userRepository.create(itemData);
    const res = await this.userRepository.create(item);
    console.log(res);
    return UserResponse.toResponse(res);
  }
  async findAll(query: CollectionQuery) {
    query.where.push();
    const response = await this.userRepository.findAll(query);
    return response;
  }
  async findAllPublic(query: CollectionQuery) {
    query.where.push();
    const response = await this.userRepository.findAllPublic(query);
    return response;
  }
  async findOne(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<UserResponse> {
    return await this.userRepository.findOne(id, relations, withDeleted);
  }
  async update(itemData: any): Promise<UserResponse> {
    if (!itemData.id) throw new BadRequestException(`Id is mandatory`);
    await this.findOneOrFail(itemData.id);
    await this.userRepository.update(itemData.id, itemData);
    const res = await this.findOne(itemData.id);
    return res;
  }
  async addAlertConfiguration(
    alertConfiguration: UserAlertConfiguration,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne(alertConfiguration.userId);
    if (!user) throw new BadRequestException(`User doesn't exist`);
    user.alertConfiguration = user.alertConfiguration ? user.alertConfiguration : []

    const isNameProvided = !!(alertConfiguration.alertName && alertConfiguration.alertName.trim().length > 0);
    if (isNameProvided) {
      const exists = user.alertConfiguration.some(
        (item) => ((item.alertName || '').trim() === alertConfiguration.alertName.trim()),
      );
      if (exists) {
        throw new BadRequestException('Alert with the same alertName already exists');
      }
    } else {
      // Auto-assign a numeric alertName (1,2,3,...) if none provided
      const numericNames = (user.alertConfiguration || [])
        .map((i) => {
          const name = (i.alertName || '').trim();
          const n = parseInt(name, 10);
          return !isNaN(n) && name === String(n) ? n : null;
        })
        .filter((n) => n !== null) as number[];
      let nextIndex = numericNames.length > 0
        ? Math.max(...numericNames) + 1
        : (user.alertConfiguration?.length || 0) + 1;
      // Ensure no collision even if non-numeric names match the number as string
      while (user.alertConfiguration.some((i) => (i.alertName || '').trim() === String(nextIndex))) {
        nextIndex += 1;
      }
      alertConfiguration.alertName = String(nextIndex);
    }

    // Add new alert configuration
    // Ensure a unique UUID id for the new alert
    const existingIds = new Set(
      (user.alertConfiguration || [])
        .map((i) => (i.id || '').trim())
        .filter((v) => v),
    );
    if (!alertConfiguration.id || existingIds.has(alertConfiguration.id.trim())) {
      let newId = randomUUID();
      while (existingIds.has(newId)) {
        newId = randomUUID();
      }
      alertConfiguration.id = newId;
    }

    user.alertConfiguration.push(alertConfiguration);

    await this.userRepository.update(user.id, user);
    const res = await this.findOne(user.id);
    return res;
  }
  async updateAlertConfiguration(alertConfiguration: UserAlertConfiguration): Promise<UserResponse> {
    const user = await this.userRepository.findOne(alertConfiguration.userId);
    if (!user) throw new BadRequestException(`User doesn't exist`);
    const hasName = !!(alertConfiguration.alertName && alertConfiguration.alertName.trim().length > 0);
    if (!hasName) {
      throw new BadRequestException('alertName is required');
    }
    const index = user.alertConfiguration.findIndex(
      (item) => ((item.id || '').trim() === alertConfiguration.id),
    );
    if (index === -1) {
      throw new NotFoundException('Alert configuration not found');
    }
    const conflict = user.alertConfiguration.some((item, i) =>
      i !== index && ((item.id || '').trim() === alertConfiguration.id),
    );
    if (conflict) {
      throw new BadRequestException('Alert with the same alertName already exists');
    }

    user.alertConfiguration[index] = alertConfiguration;
    await this.userRepository.update(user.id, user);
    const res = await this.findOne(user.id);
    return res;
  }
  async getAlertConfiguration(userId: string): Promise<UserAlertConfiguration[]> {
    const user = await this.userRepository.findOne(userId);
    if (!user) throw new BadRequestException(`User doesn't exist`);
    return user.alertConfiguration as UserAlertConfiguration[];
  }
  async deleteAlertCOnfiguration(
    alertName: string,
    userId: string,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne(userId);
    if (!user) throw new BadRequestException(`User doesn't exist`);
    const index = user.alertConfiguration.findIndex(
      (item) => item.alertName === alertName || item.industry === alertName,
    );
    if (index !== -1) {
      user.alertConfiguration.splice(index, 1);
    }
    const newConfig = user.alertConfiguration.filter(
      (item) => item.alertName != alertName,
    );
    user.alertConfiguration = newConfig;
    await this.userRepository.update(user.id, user);
    const res = await this.findOne(user.id);
    return res;
  }
  async softDelete(id: string): Promise<any> {
    await this.findOneOrFail(id);
    await this.userRepository.softDelete(id);
    return true;
  }
  async restore(id: string): Promise<void> {
    await this.findOneOrFailWithDeleted(id);
    await this.userRepository.restore(id);
  }
  async findAllArchived(query: CollectionQuery) {
    if (!query.where) {
      query.where = [];
    }
    query.where.push([
      { column: 'deletedAt', value: '', operator: 'IsNotNull' },
    ]);
    const response = this.userRepository.findAll(query);
    return response;
  }
  private async findOneOrFail(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<UserResponse> {
    const item = await this.findOne(id, relations, withDeleted);
    if (!item) {
      throw new NotFoundException(`Not found`);
    }
    return item;
  }
  private async findOneOrFailWithDeleted(id: any): Promise<UserResponse> {
    const item = await this.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return item;
  }
  async getOneByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<UserResponse> {
    const response = await this.userRepository.getOneByCriteria({
      criteria,
      relations,
      withDeleted,
    });

    return UserResponse.toResponse(response);
  }
  async getManyByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<UserResponse[]> {
    const response = await this.userRepository.getManyByCriteria({
      criteria,
      relations,
      withDeleted,
    });
    return response;
  }
  async sendPasswordResetEmail(command: SendPasswordResetLinkCommand): Promise<{
    message: string,
    data: any,
  }> {
    const resetLink = `${process.env.PASSWORD_RESET_LINK}`;
    let lookup: LookupEntity = null
    if (command.email) {
      lookup = await this.lookupRepository.getOneByCriteria(
        {
          email: command.email,
        }, ['user']
      );

    } else if (command.phoneNumber) {
      lookup = await this.lookupRepository.getOneByCriteria(
        {
          phoneNumber: command.phoneNumber,
        }, ['user']
      );
    }

    if (!lookup)
      throw new NotFoundException(`User with email ${command.email} or phone number ${command.phoneNumber} doesn't exist`);
    const userName = command.email ? command.email : command.phoneNumber;
    const createPasswordResetCommand: CreatePasswordResetCommand = {
      email: userName,
      token: null,
      status: 'Started',
      userId: null,
      employeerId: null
    }
    if (command.email) {
      const alreadySent = await this.passwordResetQuery.getPasswordResetByEmailOrPhone(userName);
      if (alreadySent) {
        let isTokenValid = null;
        try {
          isTokenValid = await this.jwtService.verifyAsync(alreadySent.token, {
            secret:
              '669e081f0821d394b54b7dbad62a6e429df0fee54f905e9d1c7de1dab373a57cd4e4c871245b58ceb2a788451c9b95a3ffbbb803fb0818e566041fe10482b281',
          });
        } catch (error) {
          isTokenValid = false;
        }
        if (isTokenValid) {
          throw new BadRequestException('Password reset link is already sent please check your inbox or spam folder');
        } else {
          await this.passwordResetCommand.deletePasswordResetByEmailOrPhone(userName);
        }
      }
      let payload: UserInfo = null
      let firstName = '';
      let middleName = '';
      let lastName = '';

      if (lookup.userType == UserType.EMPLOYEE) {
        const user = lookup.user;
        firstName = user.firstName;
        middleName = user.middleName;
        lastName = user.lastName;
        createPasswordResetCommand.userId = user.id;
        payload = {
          id: user.id,
          email: user?.email,
          firstName: user?.firstName,
          middleName: user?.middleName,
          lastName: user?.lastName,
          phoneNumber: user?.phone,
          profileImage: user?.profile,
          address: user?.address,
          skills: user?.technicalSkills,
          industry: user?.industry,
          userType: UserType.EMPLOYEE
        };
      } else {
        createPasswordResetCommand.employeerId = lookup.id;
        firstName = lookup.firstName;
        middleName = lookup.middleName;
        lastName = lookup.lastName;
        payload = {
          id: lookup.id,
          email: lookup?.email,
          firstName: lookup?.firstName,
          middleName: lookup?.middleName,
          lastName: lookup?.lastName,
          phoneNumber: lookup?.phoneNumber,
          profileImage: lookup?.profileImage,
          address: lookup?.address,
          userType: UserType.EMPLOYER
        };
      }
      const token = Util.GenerateToken(payload, '1h');
      const resetLinkWithToken = `${resetLink}?token=${token}`;
      const html = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2>Hello ${firstName} ${middleName} ${lastName},</h2>
                  <p>
                    We received a request to reset your password. You can set a new password by clicking the button below:
                  </p>
                  <a 
                    href="${resetLinkWithToken}"
                    style="
                      display: inline-block;
                      padding: 12px 24px;
                      margin: 20px 0;
                      font-size: 16px;
                      color: white;
                      background-color: #28a745;
                      text-decoration: none;
                      border-radius: 6px;
                    "
                    target="_blank"
                  >
                    Reset My Password
                  </a>
                  <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
                  <p><a href="${resetLinkWithToken}">${resetLinkWithToken}</a></p>
                  <p>This link will expire in 1 hour for your security. If you did not request a password reset, please ignore this email.</p>
                  <p>Stay safe!<br/>— The YourCompany Team</p>
         </div>
      `;
      const response = this.emailService.sendGridEmail(
        command.email,
        `Regarding you'r password reset`,
        html,
        `${firstName} ${middleName} ${lastName}`
      );
      if (response) {
        createPasswordResetCommand.token = token;
        createPasswordResetCommand.status = 'Started';
        createPasswordResetCommand.email = userName;
        createPasswordResetCommand.userId = lookup?.userId;
        const result = await this.passwordResetCommand.createPasswordReset(createPasswordResetCommand);
        return {
          message: 'Email sent successfully',
          data: result,
        }
      } else {
        throw new BadRequestException('Failed to send email');
      }
    } else if (command.phoneNumber) {
      const response = await this.afroMessageService.sendOtp(command.phoneNumber, null);
      if (response) {
        createPasswordResetCommand.employeerId = lookup.userType == UserType.EMPLOYER ? lookup.id : null
        createPasswordResetCommand.userId = lookup.userType == UserType.EMPLOYEE ? lookup?.userId : null
        createPasswordResetCommand.userId = lookup?.userId
        const result = await this.passwordResetCommand.createPasswordReset(createPasswordResetCommand);
        return {
          message: 'Otp sent successfully',
          data: result,
        }
      } else {
        throw new BadRequestException('Failed to send otp');
      }
    } else {
      throw new BadRequestException('Either email or phone number is required');
    }

  }
  async resetUserPasswordByEmailOrPhone(
    command: AccountPasswordReset,
  ): Promise<any> {
    let lookup: LookupEntity = null
    if (command.email) {
      lookup = await this.lookupRepository.getOneByCriteria({
        email: command.email,
      }, ['user']
      );
    } else if (command.phoneNumber) {
      lookup = await this.lookupRepository.getOneByCriteria({
        phoneNumber: command.phoneNumber,
      }, ['user']
      );
    } else {
      throw new BadRequestException('Either email or phone number is required');
    }
    if (!lookup)
      throw new NotFoundException(
        `User with email ${command.email} or phone number ${command.phoneNumber} doesn't exist`,
      );
    const resetPasswordData = await this.passwordResetQuery.getPasswordResetByEmailOrPhone(command.email ?? command.phoneNumber);
    if (!resetPasswordData) {
      throw new NotFoundException(`Password reset link is invalid`);
    }
    const isTOkenVerified = this.jwtService.verify(resetPasswordData?.token, {
      secret: process.env.JWT_SECRET,
    });
    if (!isTOkenVerified) {
      await this.passwordResetCommand.deletePasswordResetByEmailOrPhone(command.email);
      return await this.sendPasswordResetEmail({
        email: command.email,
        link: `${process.env.PASSWORD_RESET_LINK}`,
        phoneNumber: command.phoneNumber,
      });
      // throw new ConflictException(`A new password reset link has been sent to your email please check your inbox or spam folder the link will expire in 24 hours`);
    }
    if (command.newPassword !== command.confirmNewPassword) {
      throw new ConflictException(
        `The password and confirm password doesn't match`,
      );
    }
    const user = lookup?.user;
    const payload: UserInfo = {
      id: user.id,
      email: user?.email,
      firstName: user?.firstName,
      middleName: user?.middleName,
      lastName: user?.lastName,
      phoneNumber: user?.phone,
      profileImage: user?.profile,
      address: user?.address,
      skills: user?.technicalSkills,
      industry: user?.industry,
      userType: user ? UserType.EMPLOYEE : UserType.EMPLOYER
    };
    const encryptedPassword = Util.hashPassword(command.newPassword);
    lookup.password = encryptedPassword;
    await this.lookupRepository.create(lookup);
    resetPasswordData.status = 'Completed';
    await this.passwordResetCommand.updatePasswordReset(resetPasswordData)
    const accessToken = Util.GenerateToken(payload, '60m'); //60m
    const refreshToken = Util.GenerateRefreshToken(payload);
    await this.sessionCommand.createSession(
      {
        accountId: payload.id,
        token: accessToken,
        refreshToken,
      },
      // connection,
    );
    return {
      accessToken,
      refreshToken,
      profile: {
        ...UserResponse.toResponse(user),
      },
    };
  }
  async configureUserSmsAlert(command: UserAlertConfiguration[]): Promise<any> {
    if (command.length == 0)
      throw new BadRequestException(
        `User SMS alert configuration must contain at least one configuration`,
      );
    const user = await this.findOneOrFail(command[0].userId);
    user.smsAlertConfiguration = command;
    await this.userRepository.create(user);
    return true;
  }
  async getUsersInactiveForTwoMonths(): Promise<UserResponse[]> {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('"user"."deletedAt" IS NULL')
      .andWhere('"user"."lastLoginDate" < :cutoff', { cutoff: twoMonthsAgo })
      .getMany();

    return users.map(u => UserResponse.toResponse(u as any));
  }
}
