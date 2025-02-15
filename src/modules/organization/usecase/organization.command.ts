import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationEntity } from '../persistencies/organization.entity';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
export class CreateOrganizationCommand {
  id?: string;
  @ApiProperty()
  tinNumber: string;
  @ApiProperty()
  companyName: string;
  @ApiProperty()
  industry: string;
  @ApiProperty()
  companySize: string;
  @ApiProperty()
  headquarters: string;
  @ApiProperty()
  website: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  companyLogo: FileDto;
  @ApiProperty()
  verified: boolean;
 
  static fromDto(
    dto: CreateOrganizationCommand,
  ): OrganizationEntity {
    const entity = new OrganizationEntity();
    if (!dto) {
      return null;
    }
    entity.id = dto?.id;
    entity.tinNumber = dto.tinNumber;
    entity.companyName = dto.companyName;
    entity.industry = dto?.industry;
    entity.companySize = dto?.companySize;
    entity.headquarters = dto?.headquarters;
    entity.website = dto?.website;
    entity.description = dto?.description;
    entity.companyLogo = dto?.companyLogo;
    entity.verified = dto?.verified;
  }

  /**
   * Transfer list of DTO object to Entity  list
   *
   */
  static fromDtos(
    dto: CreateOrganizationCommand[],
  ): OrganizationEntity[] {
    return dto?.map((d) =>
        CreateOrganizationCommand.fromDto(d),
    );
  }
}
export class UpdateOrganizationCommand extends CreateOrganizationCommand {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

