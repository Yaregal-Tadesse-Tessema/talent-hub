/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { TenantEntity } from 'src/modules/tenant/persistencies/tenant.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CHAPA = 'chapa',
  TELEBIRR = 'telebirr',
  BANK_OF_ABYSSINIA = 'bank_of_abyssinia',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
}

export enum PaymentType {
  JOB_POSTING = 'job_posting',
  PREMIUM_SUBSCRIPTION = 'premium_subscription',
  APPLICATION_FEE = 'application_fee',
  FEATURED_JOB = 'featured_job',
  PREMIUM_USER = 'premium_user',
}

@Entity({ name: 'payments' })
export class PaymentEntity extends CommonEntity {
  @Column({ unique: true })
  transactionId: string; // Chapa transaction ID

  @Column()
  amount: number; // Amount in ETB (cents)

  @Column()
  currency: string; // Default: ETB

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentType })
  paymentType: PaymentType;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  chapaReference: string; // Chapa reference number

  @Column({ nullable: true, type: 'jsonb' })
  chapaResponse: any; // Store Chapa API response

  @Column({ nullable: true, type: 'jsonb' })
  webhookData: any; // Store webhook data

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  refundAmount: number;

  @Column({ nullable: true })
  refundReason: string;

  @Column({ nullable: true })
  refundedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  // Relations
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => TenantEntity, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @Column({ nullable: true })
  tenantId: string;

  // Reference to the item being paid for
  @Column({ nullable: true })
  referenceId: string; // e.g., job posting ID, subscription ID

  @Column({ nullable: true })
  referenceType: string; // e.g., 'job_posting', 'subscription'
}
