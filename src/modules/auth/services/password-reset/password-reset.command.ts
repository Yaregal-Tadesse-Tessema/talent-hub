import { IsString, IsOptional, IsUUID, IsEmail } from 'class-validator';
import { PasswordResetEntity } from '../../persistances/password-reset/password-reset.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePasswordResetCommand {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  token?: string;

  @IsOptional()
  @ApiProperty()
  userId?: string;

  @IsOptional()
  @ApiProperty()
  employeerId?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  status?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  phoneNumber?: string;

  @IsOptional()
  @ApiProperty()
  date?: Date;

  static fromCommand(command: CreatePasswordResetCommand): PasswordResetEntity {
    const entity = new PasswordResetEntity();
    if (command.id) entity.id = command.id;
    if (command.token) entity.token = command.token;
    if (command.userId) entity.userId = command.userId;
    if (command.employeerId) entity.employeerId = command.employeerId;
    if (command.email) entity.email = command.email;
    if (command.status) entity.status = command.status;
    if (command.phoneNumber) entity.phoneNumber = command.phoneNumber;
    if (command.date) entity.date = command.date;
    return entity;
  }
}

export class UpdatePasswordResetCommand extends CreatePasswordResetCommand {
  @IsUUID()
  id: string;

}

export class DeletePasswordResetCommand {
  @IsUUID()
  id: string;

  static fromCommand(command: DeletePasswordResetCommand): Partial<PasswordResetEntity> {
    return { id: command.id };
  }
}

export class ArchivePasswordResetCommand {
  @IsUUID()
  id: string;

  static fromCommand(command: ArchivePasswordResetCommand, entity?: PasswordResetEntity): PasswordResetEntity {
    const archived = entity ? entity : new PasswordResetEntity();
    archived.id = command.id;
    archived.status = 'Archived';
    return archived;
  }
}


