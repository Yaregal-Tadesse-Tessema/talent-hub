/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { UserEntity } from '../persistence/users.entity';
import { UserStatusEnums } from '../constants';
export class CreateUserCommand {
  id?: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  middleName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  gender: string;
  @ApiProperty({ default: UserStatusEnums.ACTIVE })
  status: UserStatusEnums;
  @ApiProperty()
  password: string;
  @ApiProperty()
  profile: any;
  static fromDto(dto: CreateUserCommand): UserEntity {
    const entity = new UserEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.phone = dto.phone;
    entity.email = dto.email;
    entity.firstName = dto?.firstName;
    entity.middleName = dto?.middleName;
    entity.lastName = dto?.lastName;
    entity.gender = dto?.gender;
    entity.status = dto?.status;
    entity.password = dto?.password;
    entity.profile = dto?.profile;
    return entity;
  }
  static fromDtos(dto: CreateUserCommand[]): UserEntity[] {
    return dto?.map((d) => CreateUserCommand.fromDto(d));
  }
}
export class UpdateUserCommand extends CreateUserCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

