/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { LookupEntity } from './lookup.entity';

@Entity({ name: 'testimonials' })
export class TestimonialsEntity extends CommonEntity {
  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;
  @Column({ name: 'lookup_id', nullable: true })
  lookupId: string;
  @Column({ name: 'testimonial' })
  testimonial: string;

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @ManyToOne(() => LookupEntity)
  @JoinColumn({ name: 'lookup_id' })
  user: LookupEntity;
}