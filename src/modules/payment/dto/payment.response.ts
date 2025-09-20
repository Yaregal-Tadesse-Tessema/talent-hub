/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod, PaymentType, PaymentEntity } from '../entities/payment.entity';

export class PaymentResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentType })
  paymentType: PaymentType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  customerEmail: string;

  @ApiProperty()
  customerPhone: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  chapaReference: string;

  @ApiProperty()
  failureReason: string;

  @ApiProperty()
  refundAmount: number;

  @ApiProperty()
  refundReason: string;

  @ApiProperty()
  refundedAt: Date;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  referenceId: string;

  @ApiProperty()
  referenceType: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  checkoutUrl?: string;

  static toResponse(entity: PaymentEntity): PaymentResponse{
    const response = new PaymentResponse();
    response.id = entity.id;
    response.transactionId = entity.transactionId;
    response.amount = entity.amount;
    response.currency = entity.currency;
    response.status = entity.status;
    response.paymentMethod = entity.paymentMethod;
    response.paymentType = entity.paymentType;
    response.description = entity.description;
    response.customerEmail = entity.customerEmail;
    response.customerPhone = entity.customerPhone;
    response.customerName = entity.customerName;
    response.chapaReference = entity.chapaReference;
    response.failureReason = entity.failureReason;
    response.refundAmount = entity.refundAmount;
    response.refundReason = entity.refundReason;
    response.refundedAt = entity.refundedAt;
    response.completedAt = entity.completedAt;
    response.expiresAt = entity.expiresAt;
    response.referenceId = entity.referenceId;
    response.referenceType = entity.referenceType;
    response.userId = entity.userId;
    response.tenantId = entity.tenantId;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    // response.checkoutUrl = entity.checkoutUrl;
    return response;
  }
}

