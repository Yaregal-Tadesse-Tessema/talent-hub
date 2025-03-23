import { CommonEntity } from '@libs/common/common.entity';
import { EntityMeta } from '@libs/common/decorators/entity-prefix';
import { Column, Entity, OneToMany } from 'typeorm';
import { TenantDocumentEntity } from './tenant-documents.entity';

@Entity({ name: 'tenant_document_types' })
@EntityMeta('dct')
export class TenantDocumentTypeEntity extends CommonEntity {
  @Column({ name: 'name', unique: true })
  name: string;
  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ name: 'code', unique: true })
  code: string;
  @Column({ name: 'has_expired_date', default: false })
  hasExpiredDate: boolean;
  @Column({ name: 'is_mandatory', default: false })
  isMandatory: boolean;
  @Column({ name: 'is_organization_document', default: false })
  isOrganizationDocument: boolean;
  @Column({ name: 'is_employee_document', default: false })
  isEMployeeDocument: boolean;
  @OneToMany(
    () => TenantDocumentEntity,
    (employeeDocument) => employeeDocument.documentType,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  tenantDocuments: TenantDocumentEntity[];
}
