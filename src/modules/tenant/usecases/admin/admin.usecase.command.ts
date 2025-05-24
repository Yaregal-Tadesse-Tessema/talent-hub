/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AdminUserRepository } from '../../persistencies/admin.repository';
@Injectable()
export class AdminUserService {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}
}