import { CommonEntity } from '@libs/common/common.entity';
import { Column, Entity, JoinColumn, ManyToOne} from 'typeorm';
import { FileDto } from '@libs/common/file-dto';
import { EntityMeta } from '@libs/common/decorators/entity-prefix';
import { TenantDocumentTypeEntity } from './tenant-document-type.entity';

@Entity({ name: 'tenant_document' })
@EntityMeta('doc')
export class TenantDocumentEntity extends CommonEntity {
  @Column({ name: 'tenant_id', nullable: true })
  tenantId: number;
//   @Column({ name: 'document_type_id' })
//   documentTypeId: string;
  @Column({ name: 'expire_date', type: 'date', nullable: true })
  expireDate: Date;
  @Column({ name: 'file', type: 'jsonb' })
  file: FileDto;
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  @ManyToOne(
    () => TenantDocumentTypeEntity,
    (documentType) => documentType.tenantDocuments,
    {
      orphanedRowAction: 'delete',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'document_type_id' })
  documentType: TenantDocumentTypeEntity;
}
