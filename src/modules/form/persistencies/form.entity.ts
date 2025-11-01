/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { FormStatusEnum } from '../constants';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';
import { TenantEntity } from 'src/modules/tenant/persistencies/tenant.entity';

@Entity({ name: 'forms' })
@Index(['tenantId'])
@Index(['status'])
@Index(['isActive'])
export class FormEntity extends CommonEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  tenantId: string; // Owner of the form

  @Column({ default: false })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: FormStatusEnum,
    default: FormStatusEnum.DRAFT,
  })
  status: FormStatusEnum;
  
  @Column({ type: 'jsonb', nullable: true })
  design: any; // Form.io form design JSON

  @OneToMany(() => JobPostingEntity, (jobPost) => jobPost.form, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  jobPosts: JobPostingEntity[];

  @ManyToOne(() => TenantEntity, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;
}

