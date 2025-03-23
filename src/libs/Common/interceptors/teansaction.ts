/* eslint-disable prettier/prettier */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { catchError, concatMap, finalize } from 'rxjs';

export const ENTITY_MANAGER_KEY = 'ENTITY_MANAGER_KEY';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private connection: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<any> {
    const req = context.switchToHttp().getRequest<Request>();

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('Setting ENTITY_MANAGER_KEY');
    console.log(
      'QueryRunner Transaction Started:',
      queryRunner.isTransactionActive,
    );
    req[ENTITY_MANAGER_KEY] = queryRunner.manager;

    return next.handle().pipe(
      concatMap(async (data) => {
        await queryRunner.commitTransaction();
        return data;
      }),
      catchError(async (e) => {
        await queryRunner.rollbackTransaction();
        throw e;
      }),
      finalize(async () => {
        await queryRunner.release();
      }),
    );
  }
}
