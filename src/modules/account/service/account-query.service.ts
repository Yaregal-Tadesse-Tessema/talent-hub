// /* eslint-disable prettier/prettier */
// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { AccountResponse } from '../dtos/response.dto/account.response.dto';
// import { AccountEntity } from '../persistances/account.entity';
// import axios from 'axios';
// import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
// import { CollectionQuery } from 'src/libs/Common/collection-query/query';
// import { QueryConstructor } from 'src/libs/Common/collection-query/query-constructor';
// @Injectable()
// export class AccountQueryService {
//   constructor(
//     @InjectRepository(AccountEntity)
//     private readonly accountRepository: Repository<AccountEntity>,
//   ) {}
//   private readonly axiosInstance = axios.create({
//     baseURL: 'https://etrade.gov.et/api',
//     timeout: 5000,
//     headers: {
//       Referer: 'https://etrade.gov.et/business-license-checker',
//     },
//   });
//   async getAccountById(id: string) {
//     const res = await this.accountRepository.findOne({
//       where: { id },
//     });
//     return res;
//   }
//   async getBusinessLicenseFromEtrade(
//     LicenseNo: string,
//     tin: string,
//   ): Promise<{ status: number; data: any }> {
//     try {
//       const response = await this.axiosInstance.get(
//         `/BusinessMain/GetBusinessByLicenseNo?LicenseNo=${LicenseNo}&Tin=${tin}&Lang=en`,
//       );
//       return { status: response.status, data: response.data };
//     } catch (error) {
//       console.log(error);
//       throw new BadRequestException(
//         'Unable to verify Business License. Please try again',
//       );
//     }
//   }

//   async getAccountByIdWithServiceCategory(id: string): Promise<any> {
//     return this.accountRepository.findOne({
//       where: { id },
//     });
//   }

//   async getAccountByEmail(userName: string): Promise<AccountEntity> {
//     const result = await this.accountRepository.findOne({
//       where: [{ email: userName }, { phone: userName }],
//       relations: { organization: true },
//     });
//     if (!result) return null;
//     return result;
//   }
//   async getAccountByPhone(phone: string): Promise<any> {
//     const result = await this.accountRepository.findOne({
//       where: { phone: phone },
//     });
//     if (!result) return null;
//     return result;
//   }
//   async getArchivedAccountByUserId(userID): Promise<AccountResponse> {
//     const queryBuilder = this.accountRepository.createQueryBuilder('account');
//     queryBuilder.withDeleted().where('account.user_id=:userID', { userID });
//     const result = await queryBuilder.getMany();
//     console.log('result', result);
//     if (result.length == 0) return null;
//     if (!result || result.length == 0) {
//       throw new NotFoundException(`Archived Account  not found`);
//     }
//     return AccountResponse.fromEntity(result[0]);
//   }
//   async getAccountByAccountId(accountId: string): Promise<AccountResponse> {
//     console.log('account Id is : ', accountId);
//     const result = await this.accountRepository.findOne({
//       where: { id: accountId },
//     });
//     console.log('account Id is : ', result);
//     if (!result) {
//       throw new NotFoundException(` Account  not found`);
//     }
//     return AccountResponse.fromEntity(result);
//   }
//   async getAccounts(
//     query: CollectionQuery,
//   ): Promise<DataResponseFormat<AccountResponse>> {
//     const dataQuery = QueryConstructor.constructQuery<AccountEntity>(
//       this.accountRepository,
//       query,
//     );
//     const [items, total] = await dataQuery.getManyAndCount();
//     const data = items.map((item) => AccountResponse.fromEntity(item));
//     return { items: data, total: total };
//   }
//   async getUserIdBycredentials(
//     userName: string,
//     password: string,
//   ): Promise<AccountResponse> {
//     const result = await this.accountRepository.find({
//       where: { userName: userName, password: password },
//     });
//     if (result.length == 0) return null;
//     return result ? AccountResponse.fromEntity(result[0]) : null;
//   }
// }
