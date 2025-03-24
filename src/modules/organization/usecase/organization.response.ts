// /* eslint-disable prettier/prettier */
// import { ApiProperty } from '@nestjs/swagger';
// import { OrganizationEntity } from '../persistencies/organization.entity';
// import { FileDto } from 'src/libs/Common/dtos/file.dto';
// import { AccountResponse } from 'src/modules/account/dtos/response.dto/account.response.dto';
// export class OrganizationResponse {
//   @ApiProperty()
//   id: string;
//   @ApiProperty()
//   tinNumber: string;
//   @ApiProperty()
//   companyName: string;
//   @ApiProperty()
//   industry: string;
//   @ApiProperty()
//   companySize: string;
//   @ApiProperty()
//   headquarters: string;
//   @ApiProperty()
//   website: string;
//   @ApiProperty()
//   description: string;
//   @ApiProperty()
//   companyLogo: FileDto;
//   @ApiProperty()
//   verified: boolean;
//   @ApiProperty()
//   organizationNumber: string;
//   accounts: AccountResponse[];
//   static toResponse(entity: OrganizationEntity): OrganizationResponse {
//     const response = new OrganizationResponse();
//     if (!entity) {
//       return null;
//     }
//     response.id = entity.id;
//     response.tinNumber = entity.tinNumber;
//     response.companyName = entity.companyName;
//     response.industry = entity.industry;
//     response.companySize = entity.companySize;
//     response.headquarters = entity.headquarters;
//     response.website = entity?.website;
//     response.description = entity.description;
//     response.companyLogo = entity.companyLogo;
//     response.verified = entity.verified;
//     response.organizationNumber = entity.organizationNumber;
//     if (response.accounts.length > 0) {
//       response.accounts = entity.accounts.map((item) =>
//         AccountResponse.fromEntity(item),
//       );
//     }
//   }
// }
