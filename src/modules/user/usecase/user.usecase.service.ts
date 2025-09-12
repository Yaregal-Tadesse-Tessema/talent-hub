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
import { HttpStatusCode } from 'axios';
import { SessionCommand } from 'src/modules/auth/services/session/session.usecase.command';
import { PasswordResetCommand } from 'src/modules/auth/services/password-reset/password-reset.usecase.service';
import { PasswordResetQuery } from 'src/modules/auth/services/password-reset/password-reset.usecase.query';
import { CreateLookupCommand } from 'src/modules/tenant/usecases/lookup/lookup.command';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import { LookupRepository } from 'src/modules/tenant/persistencies/lookup.repository';
import { UserType } from 'src/modules/tenant/constants';
import { CreatePasswordResetCommand } from 'src/modules/auth/services/password-reset/password-reset.command';
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
      throw new BadRequestException(`User with id ${userId} doesn't exist`);
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
    const user = await this.userRepository.findOne(command.id);
    if (!user)
      throw new NotFoundException(
        `Account with id ${command.id} doesn't exist`,
      );
    if (user.password != command.oldPassword)
      throw new BadRequestException(`Incorrect Old Password`);
    user.password = command.newPassword;
    await this.userRepository.create(user);
    return true;
  }
  async sendActivationMessage(
    to: string,
    userFullName: string,
    token: string,
    userId: string,
  ): Promise<boolean> {
    const activationLink = `http://138.197.105.31:3010/api/users/activate-account/${userId}?token=${token}`;
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
      return res.redirect('http://138.197.105.31:3000/?status=activationSent'); // frontend error page indicating a new activation is sent
    }
    if (!payload?.id) throw new NotFoundException(`user Id not Found`);
    const user = await this.userRepository.findOne(payload.id);
    if (user.status == UserStatusEnums.ACTIVE) {
      return res.redirect(
        'http://138.197.105.31:3000/login?status=alreadyActivated',
      );
    }
    const success = await this.userRepository.update(payload.id, {
      status: UserStatusEnums.ACTIVE,
    });
    if (success) {
      return res.redirect(
        'http://138.197.105.31:3000/login?status=successfullyActivated',
      ); // frontend success page
    } else {
      return res.redirect('http://138.197.105.31:3000/status=failedToActivate'); // frontend error page
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
    if (userAlreadyCreated?.status == UserStatusEnums.ACTIVE) {
      throw new HttpException('User already created', HttpStatusCode.AlreadyReported);
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
    const password = Util.hashPassword(itemData.password);
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
    if (item?.email) {
      const token = Util.GenerateToken(uerInfo);
      await this.sendActivationMessage(
        item.email,
        `${item.firstName} ${item.middleName} ${item.lastName}`,
        token,
        item.id,
      );
    } else {
      // Send Message
    }
    return item;
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
    if (!itemData.id) throw new BadRequestException(`Id id mandatory`);
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
    user.alertConfiguration.push(alertConfiguration);
    await this.userRepository.update(user.id, user);
    const res = await this.findOne(user.id);
    return res;
  }
  async deleteAlertCOnfiguration(
    alertConfiguration: UserAlertConfiguration,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne(alertConfiguration.userId);
    if (!user) throw new BadRequestException(`User doesn't exist`);
    const newConfig = user.alertConfiguration.filter(
      (item) => item != alertConfiguration,
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
      throw new NotFoundException(`not_found`);
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

  async sendPasswordResetEmail(email: string, link = 'http://138.197.105.31:3000/reset-password'): Promise<boolean> {
    const resetLink = `${link}`;
    const lookup = await this.lookupRepository.getOneByCriteria(
      [{
        email: email,
      }, {
        phoneNumber: email,
      }], ['user']
    );
    if (!lookup)
      throw new NotFoundException(`User with email ${email} doesn't exist`);
    const alreadySent = await this.passwordResetQuery.getPasswordResetByEmail(email);
    if (alreadySent) {
      const isTokenValid = await this.jwtService.verifyAsync(alreadySent.token, {
        secret:
          '669e081f0821d394b54b7dbad62a6e429df0fee54f905e9d1c7de1dab373a57cd4e4c871245b58ceb2a788451c9b95a3ffbbb803fb0818e566041fe10482b281',
      });

      if (isTokenValid) {
        throw new ConflictException(`Password reset link already sent to ${email} do not forget to check your spam folder`);
      } else {
        await this.passwordResetCommand.deletePasswordResetByEmail(email);
      }
    }
    let payload: UserInfo = null
    let firstName = '';
    let middleName = '';
    let lastName = '';
    const createPasswordResetCommand: CreatePasswordResetCommand = {
      email: email,
      token: null,
      status: 'Started',
      userId: null,
      employeerId: null
    }
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
    const resetLinkWithToken = `${link}?token=${token}`;

    const html = `
   <div style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h2>Hello ${firstName} ${middleName} ${lastName},</h2>
  <p>We received a request to reset your password. You can set a new password by clicking the button below:</p>
  <a href="${resetLinkWithToken}"
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
     target="_blank">
    Reset My Password
  </a>
  <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
  <p><a href="${resetLink}">${resetLink}</a></p>
  <p>This link will expire in 24 hours for your security. If you did not request a password reset, please ignore this email.</p>
  <p>Stay safe!<br/>— The YourCompany Team</p>
</div>

     `;
    this.emailService.sendGridEmail(
      email,
      `Regarding you'r password reset`,
      html,
    );
    await this.passwordResetCommand.createPasswordReset(createPasswordResetCommand);
    return true;
  }
  async resetUserPasswordByEmail(
    command: AccountPasswordReset,
  ): Promise<any> {
    const lookup = await this.lookupRepository.getOneByCriteria(
      [
        {
          email: command.email,
        },
        {
          phoneNumber: command.email,
        }
      ], ['user']
    );
    if (!lookup)
      throw new NotFoundException(
        `User with email ${command.email} doesn't exist`,
      );
    const resetPasswordData = await this.passwordResetQuery.getPasswordResetByEmail(command.email);
    if (!resetPasswordData) {
      throw new NotFoundException(`Password reset link is invalid`);
    }
    const isTokenExpired = this.jwtService.verify(resetPasswordData?.token);
    if (isTokenExpired) {
      await this.passwordResetCommand.deletePasswordResetByEmail(command.email);
      await this.sendPasswordResetEmail(command.email);
      throw new ConflictException(`A new password reset link has been sent to your email please check your inbox or spam folder the link will expire in 24 hours`);
    }
    if (command.newPassword !== command.confirmNewPassword) {
      throw new ConflictException(
        `The password and confirm password doesn't match`,
      );
    }
    const user = lookup.user;
    const salt = process.env.BCRYPT_SALT;
    const encryptedPassword = await bcrypt.hash(command.newPassword, salt);
    user.password = encryptedPassword;
    const response = await this.userRepository.create(user);
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
    };
    lookup.password = encryptedPassword;
    await this.lookupRepository.create(lookup);
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
}
