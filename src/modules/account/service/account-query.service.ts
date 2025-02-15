/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountResponse } from '../dtos/response.dto/account.response.dto';
import { AccountEntity } from '../persistances/account.entity';
// import { CollectionQuery } from 'src/libs/collection-query/query';
// import { QueryConstructor } from 'src/libs/collection-query/query-constructor';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
@Injectable()
export class AccountQueryService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>, 
  ) {}
  // async getAll(query: CollectionQuery): Promise<any> {
  //   if (query.orderBy.length == 0) {
  //     query.orderBy.push({ column: 'createdAt', direction: 'DESC' });
  //   }
  //   const dataQuery = QueryConstructor.constructQuery<AccountEntity>(
  //     this.accountRepository,
  //     query,
  //   );
  //   const data = await dataQuery.getManyAndCount();
  //   return data;
  // }
  // async fetch(query: CollectionQuery): Promise<DataResponseFormat<any>> {
  //   if (query.orderBy.length == 0) {
  //     query.orderBy.push({ column: 'createdAt', direction: 'DESC' });
  //   }
  //   const dataQuery = QueryConstructor.constructQuery<AccountEntity>(
  //     this.accountRepository,
  //     query,
  //   );
  //   const items = await dataQuery.getMany();
  //   const result = await this.accountRepository.find();
  //   console.log('result result result result result result result', result);
  //   return { items: items, total: items.length };
  // }

  async getAccountById(id: string) {
    const res = await this.accountRepository.findOne({
      where: { id },
    });
    return res;
  }
  async getAccountByIdWithServiceCategory(id: string): Promise<any> {
    return this.accountRepository.findOne({
      where: { id },
    });
  }
  async getAccountByEmail(userName: string): Promise<AccountEntity> {
    const result = await this.accountRepository.findOne({
      where: [
        { email: userName },
        { phone: userName },
        { organizationTin: userName },
      ],
    });
    if (!result) return null;
    return result;
  }
  async getAccountByPhone(phone: string): Promise<any> {
    const result = await this.accountRepository.findOne({
      where: { phone: phone },
    });
    if (!result) return null;
    return result;
  }
  async getArchivedAccountByUserId(userID): Promise<AccountResponse> {
    const queryBuilder = this.accountRepository.createQueryBuilder('account');
    queryBuilder.withDeleted().where('account.user_id=:userID', { userID });
    const result = await queryBuilder.getMany();
    console.log('result', result);
    if (result.length == 0) return null;
    if (!result || result.length == 0) {
      throw new NotFoundException(`Archived Account  not found`);
    }
    return AccountResponse.fromEntity(result[0]);
  }
  async getAccountByAccountId(accountId: string): Promise<AccountResponse> {
    console.log('account Id is : ', accountId);
    const result = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    console.log('account Id is : ', result);
    if (!result) {
      throw new NotFoundException(` Account  not found`);
    }
    return AccountResponse.fromEntity(result);
  }
  async getUserIdBycredentials(
    userName: string,
    password: string,
  ): Promise<AccountResponse> {
    const result = await this.accountRepository.find({
      where: { userName: userName, password: password },
    });
    if (result.length == 0) return null;
    return result ? AccountResponse.fromEntity(result[0]) : null;
  }
  // async isPhoneRegistered(email: string, phone: string): Promise<any> {
  //   const response = {
  //     email: false,
  //     phone: false,
  //     emailStatus: null,
  //     phoneStatus: null,
  //   };

  //   email = email.toLowerCase();
  //   const standardPhone = Util.standardizePhoneNumber(phone);
  //   const removedPlus = standardPhone.replace('+', '');

  //   const [emailAccount, phoneAccount] = await Promise.all([
  //     this.accountRepository.findOne({
  //       where: { email },
  //       select: ['status'],
  //     }),
  //     this.accountRepository.findOne({
  //       where: [{ phone }, { phone: standardPhone }, { phone: removedPlus }],
  //       select: ['status'],
  //     }),
  //   ]);

  //   if (emailAccount) {
  //     response.email = true;
  //     response.emailStatus = emailAccount.status;
  //   }

  //   if (phoneAccount) {
  //     response.phone = true;
  //     response.phoneStatus = phoneAccount.status;
  //   }

  //   return response;
  // }
}
