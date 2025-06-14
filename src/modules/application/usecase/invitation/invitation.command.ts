/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { InvitationEntity } from '../../persistences/invitation.entity';
export class CreateInvitationCommand {
  id?: string;
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  userId: string;
  @ApiProperty({ nullable: false })
  @IsNotEmpty()
  jobPostId: string;
  @ApiProperty()
  invitationLink?: string;
  userInfo?: any;
  static fromDto(dto: CreateInvitationCommand): InvitationEntity {
    const entity = new InvitationEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.userId = dto.userId;
    entity.jobPostId = dto.jobPostId;
    entity.invitationLink = dto?.invitationLink;
    return entity;
  }
  static fromDtos(dto: CreateInvitationCommand[]): InvitationEntity[] {
    return dto?.map((d) => CreateInvitationCommand.fromDto(d));
  }
}
export class UpdateInvitationCommand extends CreateInvitationCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}


