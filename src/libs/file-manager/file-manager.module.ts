import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileManagerService } from './file-manager.service';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
      }),
    }),
  ],
  providers: [FileManagerService],
})
export class FileManagerModule {}
