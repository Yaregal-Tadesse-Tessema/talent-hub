/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { AccountEntity } from '../persistances/account.entity';
import { CreateAccountCommand } from '../dtos/command.dto/account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {  MoreThanOrEqual, Repository } from 'typeorm';
import { EmployeeEntity } from '../persistances/employee.entity';
import { AccountStatusEnums } from 'src/modules/auth/constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountCommandService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
  ) {}
  // private userDomain: User = new User();
  // private logger = new Logger('AccountCommand Service');
  async CreateAccounts(command: CreateAccountCommand) {
    if (command.organizationTin || command.organizationName) {
      if (!command.categoryId)
        throw new BadRequestException(
          "'accountUserType' is required for organizations. Either add 'accountUserType' or remove 'organizationTin' and 'organizationName'.",
        );
    }
    try {
      command.phone = command.phone.toString();
      // const manager: EntityManager = this.request['ENTITY_MANAGER_KEY'];
      // const phone = Util.standardizePhoneNumber(command.phone);
      // Fetch accounts matching email or phone
      await this.accountRepository.find({
        where: [
          { email: command.email },
          { phone: command.phone },
        ],
      });

        command.Password = 'P@ssw0rd';
      
      let userInfo: EmployeeEntity  = null;
      const salt = process.env.BCRYPT_SALT;
      const password = await bcrypt.hash(command.Password, salt);
      command.Password = password;
      command.status = AccountStatusEnums.DRAFT;
      const entity = CreateAccountCommand.toEntity(command);
      const result = await this.accountRepository.save(entity);
      const registrationNumber = await this.generateRegistrationNumber(
        'IFHCRS',
        'Reg',
      );
        const employeeEntity = new EmployeeEntity();
        employeeEntity.accountId = result.id;
        employeeEntity.firstName = command.firstName;
        employeeEntity.middleName = command.middleName;
        employeeEntity.lastName = command.lastName;
        employeeEntity.registrationNumber = registrationNumber;
        employeeEntity.gender = command.gender;
        employeeEntity.employmentPositionId = command.employmentPositionId;

        if (command.cityId) {
          employeeEntity.cityId = command.cityId;
        }

        if (command.subCityId) {
          employeeEntity.subCityId = command.subCityId;
          if (command.woredaId) employeeEntity.woredaId = command.woredaId;
        }
        const emp = await this.employeeRepository.save(employeeEntity)
        const savedEmp = await this.employeeRepository.findOne({
          where: { id: emp.id },
          relations: ['account'],
        });
        userInfo = savedEmp;
      // return { ...AccountResponse.fromEntity(result), userEntity };
      return { ...command, status: result.status, userInfo };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  

  // async activateUserAccount(accountId: string) {
  //   const manager: EntityManager = this.request['ENTITY_MANAGER_KEY'];
  //   const result = await this.accountRepository.findOne({
  //     where: { id: accountId, status: ApplicationStatusEnums.DRAFT },
  //   });
  //   if (!result) {
  //     throw new BadRequestException('Account not found');
  //   }
  //   await manager
  //     .getRepository(AccountEntity)
  //     .update(
  //       { id: accountId },
  //       { status: ApplicationStatusEnums.ACTIVE, loginAttempts: 0 },
  //     );
  //   await this.roleQueriesService.getRoleByName('default');
  //   await this.activateLockByLocation(accountId, result.categoryId);
  //   this.userQueryService.getUserByAccountId(accountId).then((res) => {
  //     if (res) {
  //       this.notification.sendNotificationToUser({
  //         subject: 'Account activated',
  //         message: 'Account activated successfully',
  //         sender: 'IFHCRS API',
  //         receiverId: res.id,
  //         receiver: res.id,
  //         data: {},
  //         sourceId: res?.id,
  //         sourceName: 'Employee',
  //       });
  //       const loginUrl = new URL(
  //         'auth/login',
  //         this.config.get('FRONTEND_URL_USER'),
  //       );
  //       this.mailerService.sendEmail({
  //         to: res.account.email,
  //         subject: 'Account Activated',
  //         text: '',
  //         html: `<p>Your Account Has Been Activated</p> <p>Click <a href="${loginUrl.toString()}" >Here</a> to Login</p>`,
  //         sourceId: res?.id,
  //         sourceName: 'Employee',
  //       });
  //     }
  //   });
  //   return result;
  // }
  // async activateUserAccountEmailPhone(accountId: string) {
  //   const manager: EntityManager = this.request['ENTITY_MANAGER_KEY'];
  //   const account = await this.accountRepository.findOne({
  //     where: { id: accountId },
  //   });
  //   if (!account) throw new BadRequestException('account not found');

  //   const email = account.newEmail == null ? undefined : account.newEmail;
  //   const phone = account.phone == null ? undefined : account.phone;
  //   if (email) {
  //     await manager
  //       .getRepository(AccountEntity)
  //       .update({ id: accountId }, { email: email });
  //   }
  //   if (phone) {
  //     await manager
  //       .getRepository(AccountEntity)
  //       .update({ id: accountId }, { phone: phone });
  //     const result = await this.accountRepository.findOne({
  //       where: { id: accountId },
  //     });
  //     await this.activateLockByLocation(accountId, result.categoryId);
  //   }
  //   await this.roleQueriesService.getRoleByName('default');

  //   this.userQueryService.getUserByAccountId(accountId).then((res) => {
  //     this.notification.sendNotificationToUser({
  //       subject: 'Account activated',
  //       message: 'Account activated successfully',
  //       sender: 'IFHCRS API',
  //       receiverId: res.id,
  //       receiver: res.id,
  //       data: {},
  //       sourceId: res?.id,
  //       sourceName: 'Employee',
  //     });
  //     const loginUrl = new URL(
  //       'auth/login',
  //       this.config.get('FRONTEND_URL_USER'),
  //     );
  //     this.mailerService.sendEmail({
  //       to: res.account.email,
  //       subject: 'Account Activated',
  //       text: '',
  //       sourceId: res?.id,
  //       sourceName: 'Employee',
  //       html: `<p>Your Account Has Been Activated</p> <p>Click <a href="${loginUrl.toString()}" >Here</a> to Login</p>`,
  //     });
  //   });
  //   return { message: 'Successfully updated', status: 'Success' };
  // }
  // async activateEmployeeAccount(command: ActivateEmployeeAccount) {
  //   if (command.password !== command.confirmPassword) {
  //     throw new BadRequestException(
  //       'password and confirm password are not equal',
  //     );
  //   }

  //   const validatePassword = await this.validatePassword(command.password);

  //   if (validatePassword.status !== true) {
  //     throw new ForbiddenException('Invalid Password');
  //   }

  //   const salt = process.env.BCRYPT_SALT;
  //   const password = await bcrypt.hash(command.password, salt);
  //   const manager: EntityManager = this.request['ENTITY_MANAGER_KEY'];
  //   const result = await manager
  //     .getRepository(AccountEntity)
  //     .update(
  //       { id: command.accountId },
  //       { status: ApplicationStatusEnums.ACTIVE, password: password },
  //     );

  //   return result;
  // }
  async updateAccountRefreshToken(accountId: string, refreshToken: string) {
    await this.accountRepository.update(
      { id: accountId },
      { refreshToken: refreshToken },
    );
  }
  // async createAccounts(command: CreateAccountCommand[]) {
  //   try {
  //     const response = [];
  //     for (let index = 0; index < command.length; index++) {
  //       const manager: EntityManager = this.request['ENTITY_MANAGER_KEY'];
  //       const salt = process.env.BCRYPT_SALT;
  //       const password = await bcrypt.hash(command[index].Password, salt);
  //       command[index].Password = password;
  //       command[index].status = ApplicationStatusEnums.DRAFT;
  //       const account = CreateAccountCommand.toEntity(command[index]);
  //       // console.log(account);
  //       const result = await manager.getRepository(AccountEntity).save(account);
  //       if (result.accountType == 'user') {
  //         const userEntity = new UsersEntity();
  //         userEntity.accountId = result.id;
  //         await manager.getRepository(UsersEntity).save(userEntity);
  //       } else {
  //         const employeeEntity = new EmployeeEntity();
  //         employeeEntity.accountId = result.id;
  //         await manager.getRepository(EmployeeEntity).save(employeeEntity);
  //       }
  //       response.push(result);
  //       console.log(result);
  //     }
  //     return response.map((item) => AccountResponse.fromEntity(item));
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }
  // async createAccount(command: CreateAccountCommand): Promise<AccountResponse> {
  //   try {
  //     // this.userDomain = await this.userRepository.findById(command.userID)
  //     // if (!this.userDomain) {
  //     //     throw new NotFoundException(`Failed to create Account`);
  //     // }
  //     // this is for hashing the password
  //     // const salt = await bcrypt.genSalt()
  //     const salt = process.env.BCRYPT_SALT;
  //     const password = await bcrypt.hash(command.Password, salt);
  //     command.Password = password;
  //     const account = CreateAccountCommand.toEntity(command);
  //     const result = await this.accountRepository.save(account);
  //     console.log(result);
  //     return AccountResponse.fromEntity(result);
  //   } catch (error) {
  //     console.log(error);
  //     throw new HttpException(error.message, error.code);
  //   }
  // }
  // async archiveAccount(accountId: string): Promise<boolean> {
  //   try {
  //     const result = await this.accountRepository.softDelete(accountId);
  //     this.logger.log(
  //       'Archive Account command executed ',
  //       `Account  ${accountId} have been Archived`,
  //     );
  //     if (result.affected > 0) return true;
  //     return false;
  //   } catch (error) {
  //     Logger.log('Unable to Archive the Account because ', error);
  //     throw new HttpException(error.message, error.code);
  //   }
  // }
  // async unArchiveAccount(accountId: string): Promise<boolean> {
  //   try {
  //     const result = await this.accountRepository.restore(accountId);
  //     this.logger.log(
  //       'Restore Account execute',
  //       `Account ${accountId} have been restored`,
  //     );
  //     if (result.affected > 0) return true;
  //     return false;
  //   } catch (error) {
  //     this.logger.log(`unable to retore certificate ${accountId}`);
  //     throw new HttpException(error.message, error.code);
  //   }
  // }
  // async updateAccount(
  //   updateAccountCommand: UpdateAccountCommand,
  // ): Promise<AccountResponse> {
  //   try {
  //     // const accountCommand =
  //     //   UpdateAccountCommand.fromCommands(updateAccountCommand);
  //     const result = await this.accountRepository.save(updateAccountCommand);
  //     this.logger.log(
  //       'Update Account command executed ',
  //       `Account  ${this.userDomain.id} have been updated`,
  //     );
  //     return AccountResponse.fromEntity(result);
  //   } catch (error) {
  //     Logger.log('Unable to update the Experience because ', error);
  //     throw new HttpException(error.message, error.code);
  //   }
  // }
  async updateRefreshToken(accountId: string, refreshToken: string) {
    try {
      return await this.accountRepository.update(
        { id: accountId },
        { refreshToken: refreshToken },
      );
    } catch (error) {
      throw error;
    }
  }
  // async deleteAccount(accountId: string): Promise<boolean> {
  //   try {
  //     const result = await this.accountRepository.delete(accountId);
  //     this.logger.log(
  //       'Delete Account command executed ',
  //       `Account  ${this.userDomain.id} have been Deleted`,
  //     );
  //     if (result.affected > 0) return true;
  //     return false;
  //   } catch (error) {
  //     Logger.log('Unable to Delete the Account because ', error);
  //     throw new HttpException(error.message, error.code);
  //   }
  // }
  // async addQuestionnairesAnswer(
  //   accountId: string,
  //   command: AddQuestionnairesToAccountCommand[],
  // ) {
  //   try {
  //     const result = await this.accountRepository.findOne({
  //       where: { id: accountId },
  //       relations: { accountQuestionnaire: true },
  //     });
  //     const length = command.length;
  //     const accountQuestions = [];
  //     for (let index = 0; index < length; index++) {
  //       const accountQuestionnaireEntity = new AccountQuestionnaireEntity();
  //       accountQuestionnaireEntity.accountId = result.id;
  //       accountQuestionnaireEntity.questionnaireId = command[index].questionId;
  //       accountQuestionnaireEntity.answer = command[index].answer;
  //       accountQuestions.push(accountQuestionnaireEntity);
  //     }
  //     result.accountQuestionnaire = accountQuestions;
  //     const res = await this.accountRepository.save(result);
  //     console.log(res);
  //     return res;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  // async updateQuestionnairesAnswer(
  //   accountId: string,
  //   command: updateQuestionnairesToAccountCommand[],
  // ) {
  //   try {
  //     const length = command.length;
  //     const accountQuestions = [];
  //     for (let index = 0; index < length; index++) {
  //       const accountQuestionnaireEntity = new AccountQuestionnaireEntity();
  //       accountQuestionnaireEntity.id = command[index].id;
  //       accountQuestionnaireEntity.accountId = accountId;
  //       accountQuestionnaireEntity.questionnaireId = command[index].questionId;
  //       accountQuestionnaireEntity.answer = command[index].answer;
  //       accountQuestions.push(accountQuestionnaireEntity);
  //     }
  //     const res =
  //       await this.accountQuestionnaireRepository.save(accountQuestions);
  //     console.log(res);
  //     return res;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async generateRegistrationNumber(orgCode = 'IFHCRS', serviceCode: string) {
    const today = new Date();
    const dateFormatted = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0,
    );
    const shortDate =
      today.getFullYear().toString().slice(-2) +
      '' +
      ('0' + (today.getMonth() + 1)).slice(-2) +
      '' +
      ('0' + today.getDate()).slice(-2);
    const applicationResult = await this.accountRepository.count({
      where: { createdAt: MoreThanOrEqual(dateFormatted) },
    });
    const applicationNo = orgCode.concat(
      '-',
      serviceCode,
      '-',
      shortDate,
      '-',
      (applicationResult + 1).toString(),
    );
    console.log(applicationNo);
    return applicationNo;
  }

  

  private async updateAccountTokens(accountId: string, token: any) {
    const a = await this.accountRepository.update(
      { id: accountId },
      { refreshToken: token.refreshToken, accountToken: token.accessToken },
    );
    return a;
  }

}
