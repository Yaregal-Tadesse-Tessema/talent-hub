/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../persistances/admin-user.entity';
@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
  ) {}
}
