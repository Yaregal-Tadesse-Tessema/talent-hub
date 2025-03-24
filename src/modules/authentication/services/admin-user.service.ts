/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { AdminUserEntity } from '../persistances/admin-user.entity';
@Injectable()
export class AdminUserService extends CommonCrudService<AdminUserEntity> {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
  ) {
    super(adminUserRepository);
  }
}
