/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { AccountEntity } from 'src/modules/account/persistances/account.entity';
import { Entity, Column, OneToMany } from 'typeorm';
export enum AccountTypeEnums {
  ORGANIZATION = 'Organization',
  EMPLOYEE = 'employee',
  USER = 'user',
}

@Entity({ name: 'organizations' })
export class OrganizationEntity extends CommonEntity {
  @Column({ nullable: true, unique: true })
  tinNumber: string;
  @Column({ nullable: true, unique: true })
  licenseNumber: string;
  @Column({ nullable: true, unique: true })
  organizationNumber: string;
  @Column()
  companyName: string;
  @Column({ nullable: true, unique: true })
  email: string;
  @Column({ nullable: true, unique: true })
  phone: string;
  @Column()
  industry: string;
  @Column({ nullable: true })
  companySize: string;
  @Column({ nullable: true })
  headquarters: string;
  @Column({ nullable: true })
  website: string;
  @Column({ nullable: true })
  description: string;
  @Column({ type: 'jsonb', nullable: true })
  companyLogo: FileDto;
  @Column({ type: 'jsonb', nullable: true })
  address: any;
  @Column({ default: false })
  verified: boolean;

  @OneToMany(
    () => AccountEntity,
    (accountEntity) => accountEntity.organization,
    {
      onDelete: 'RESTRICT',
    },
  )
  accounts: AccountEntity[];
}
