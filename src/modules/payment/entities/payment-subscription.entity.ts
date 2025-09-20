// /* eslint-disable prettier/prettier */
// import { CommonEntity } from 'src/libs/Common/common-entity';
// import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { UserEntity } from 'src/modules/user/persistence/users.entity';
// import { TenantEntity } from 'src/modules/tenant/persistencies/tenant.entity';

// export enum SubscriptionStatus {
//   ACTIVE = 'active',
//   INACTIVE = 'inactive',
//   CANCELLED = 'cancelled',
//   EXPIRED = 'expired',
//   SUSPENDED = 'suspended',
// }

// export enum SubscriptionPlan {
//   BASIC = 'basic',
//   PREMIUM = 'premium',
//   ENTERPRISE = 'enterprise',
// }

// export enum BillingCycle {
//   MONTHLY = 'monthly',
//   QUARTERLY = 'quarterly',
//   YEARLY = 'yearly',
// }

// @Entity({ name: 'payment' })
// export class PaymentSubscriptionEntity extends CommonEntity {
//   @Column()
//   planName: string;

//   @Column({ type: 'enum', enum: SubscriptionPlan })
//   plan: SubscriptionPlan;

//   @Column({ type: 'enum', enum: BillingCycle })
//   billingCycle: BillingCycle;

//   @Column()
//   amount: number; // Amount in ETB (cents)

//   @Column()
//   currency: string; // Default: ETB

//   @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
//   status: SubscriptionStatus;

//   @Column()
//   startDate: Date;

//   @Column()
//   endDate: Date;

//   @Column({ nullable: true })
//   nextBillingDate: Date;

//   @Column({ nullable: true })
//   cancelledAt: Date;

//   @Column({ nullable: true })
//   cancellationReason: string;

//   @Column({ default: true })
//   autoRenew: boolean;

//   @Column({ nullable: true, type: 'jsonb' })
//   features: any; // Store plan features as JSON

//   @Column({ nullable: true })
//   chapaSubscriptionId: string; // Chapa subscription ID if supported

//   // Relations
//   @ManyToOne(() => UserEntity, { nullable: true })
//   @JoinColumn({ name: 'userId' })
//   user: UserEntity;

//   @Column({ nullable: true })
//   userId: string;

//   @ManyToOne(() => TenantEntity, { nullable: true })
//   @JoinColumn({ name: 'tenantId' })
//   tenant: TenantEntity;

//   @Column({ nullable: true })
//   tenantId: string;
// }
