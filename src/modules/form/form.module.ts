/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormEntity } from './persistencies/form.entity';
import { FormRepository } from './persistencies/form.repository';
import { FormService } from './usecase/form.service';
import { FormController } from './controller/form.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormEntity,
    ]),
    forwardRef(() => ApplicationModule),
  ],
  controllers: [FormController],
  providers: [FormService, FormRepository],
  exports: [FormService, FormRepository],
})
export class FormModule {}

