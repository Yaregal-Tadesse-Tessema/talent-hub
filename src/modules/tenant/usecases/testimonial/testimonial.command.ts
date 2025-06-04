/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { TestimonialsEntity } from '../../persistencies/testimonials.entity';
import { UserInfo } from 'src/libs/Common/user-information';
export class CreateTestimonialsCommand {
  id?: string;
  @ApiProperty()
  @IsNotEmpty()
  tenantId: string;
  @ApiProperty()
  lookupId: string;
  @ApiProperty()
  testimonial: string;
  currentUser?: UserInfo;

  static fromCommand(
    command: CreateTestimonialsCommand,
  ): TestimonialsEntity {
    const entity = new TestimonialsEntity();
    entity.id = command?.id;
    entity.tenantId = command.tenantId;
    entity.lookupId = command.lookupId;
    entity.testimonial = command.testimonial;
    return entity;
  }
}
export class UpdateTestimonialsCommand extends CreateTestimonialsCommand {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}

export class ArchiveTestimonialsCommand {
  @ApiProperty({
    example: 'uuid',
  })
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  currentUser: any;
}