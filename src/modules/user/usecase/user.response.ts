/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../persistence/users.entity';
import { UserStatusEnums } from '../constants';
export class UserResponse {
  @ApiProperty()
  id: string;
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
  @ApiProperty()
  status: UserStatusEnums;
  @ApiProperty()
  password: string;
  @ApiProperty()
  profile: any;
  static toResponse(entity: UserEntity): UserResponse {
    const response = new UserResponse();
    if (!entity) {
      return null;
    }
    response.id = entity?.id;
    response.phone = entity.phone;
    response.email = entity.email;
    response.firstName = entity?.firstName;
    response.middleName = entity?.middleName;
    response.lastName = entity?.lastName;
    response.gender = entity?.gender;
    response.status = entity?.status;
    // response.password = entity?.password;
    response.profile = entity?.profile;
    return response;
  }
}

