/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsEmail, IsUUID, Min } from 'class-validator';
import { PaymentStatus, PaymentMethod, PaymentType, PaymentEntity } from '../entities/payment.entity';
import { UserInfo } from 'src/libs/Common/user-information';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Amount in ETB cents' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string = 'ETB';

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentType, description: 'Type of payment' })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ description: 'Payment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ description: 'Customer phone number' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ description: 'Reference ID for the item being paid for' })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({ description: 'Reference type' })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiProperty({ description: 'Current user' })
  currentUser?: UserInfo;

  @ApiProperty({ description: 'Created at' })
  createdAt?: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt?: Date;

  static fromCommand(command: CreatePaymentDto): PaymentEntity {
    const payment = new PaymentEntity();
    payment.amount = command.amount;
    payment.currency = command.currency;
    payment.paymentMethod = command.paymentMethod;
    payment.paymentType = command?.paymentType;
    payment.description = command?.description;
    payment.customerEmail = command?.customerEmail;
    payment.customerPhone = command?.customerPhone;
    payment.customerName = command?.customerName;
    payment.referenceId = command?.referenceId;
    payment.referenceType = command?.referenceType;
    payment.userId = command?.userId;
    payment.tenantId = command?.tenantId;

    payment.createdAt = command?.createdAt;
    payment.updatedAt = command?.updatedAt;
    payment.createdBy = command?.currentUser?.id;
    payment.updatedBy = command?.currentUser?.id;
    return payment;
  }

}

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus, description: 'Payment status' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ description: 'Chapa reference number' })
  @IsString()
  @IsOptional()
  chapaReference?: string;

  @ApiProperty({ description: 'Failure reason' })
  @IsString()
  @IsOptional()
  failureReason?: string;

  @ApiProperty({ description: 'Refund amount' })
  @IsNumber()
  @IsOptional()
  refundAmount?: number;

  @ApiProperty({ description: 'Refund reason' })
  @IsString()
  @IsOptional()
  refundReason?: string;
}

export class PaymentResponseDto {
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

  static toResponse(entity: PaymentEntity): PaymentResponseDto {
    const response = new PaymentResponseDto();
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
export class ChapaMakePaymentRequestDto {
  @ApiProperty({ description: 'Transaction reference' })
  @IsString()
  @IsNotEmpty()
  checkoutUrl: string;
}
export class ChapaPaymentRequestDto {
  @ApiProperty({ description: 'Amount in ETB' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency', default: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string = 'ETB';

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  customer_email: string;

  @ApiProperty({ description: 'Customer first name' })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiProperty({ description: 'Customer phone number' })
  @IsString()
  @IsOptional()
  customer_phone?: string;

  @ApiProperty({ description: 'Transaction reference' })
  @IsString()
  @IsNotEmpty()
  tx_ref: string;

  @ApiProperty({ description: 'Payment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Return URL after payment' })
  @IsString()
  @IsOptional()
  return_url?: string;

  @ApiProperty({ description: 'Callback URL for webhooks' })
  @IsString()
  @IsOptional()
  callback_url?: string;
}

export class ChapaWebhookDto {
  @ApiProperty()
  event: string;

  @ApiProperty()
  data: {
    tx_ref: string;
    status: string;
    currency: string;
    amount: number;
    customer: {
      email: string;
      name: string;
      phone_number: string;
    };
    created_at: string;
    updated_at: string;
  };
}

export class TelebirrPaymentRequestDto {
  @ApiProperty({ description: 'Amount in ETB cents' })
  @IsNumber()
  @Min(1)
  totalAmount: number;

  @ApiProperty({ description: 'Currency code', default: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string = 'ETB';

  @ApiProperty({ description: 'Payment subject/description' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Out trade number (transaction reference)' })
  @IsString()
  @IsNotEmpty()
  outTradeNo: string;

  @ApiProperty({ description: 'Short code for payment', default: '1001' })
  @IsString()
  @IsOptional()
  shortCode?: string = '1001';

  @ApiProperty({ description: 'Receiver name' })
  @IsString()
  @IsOptional()
  receiveName?: string;

  @ApiProperty({ description: 'Timeout express', default: '30m' })
  @IsString()
  @IsOptional()
  timeoutExpress?: string = '30m';

  @ApiProperty({ description: 'Customer phone number' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;
}

export class TelebirrWebhookDto {
  @ApiProperty({ description: 'Out trade number' })
  outTradeNo: string;

  @ApiProperty({ description: 'Trade status' })
  tradeStatus: string;

  @ApiProperty({ description: 'Total amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Trade time' })
  tradeTime: string;

  @ApiProperty({ description: 'Signature' })
  sign: string;

  @ApiProperty({ description: 'App ID' })
  appId: string;

  @ApiProperty({ description: 'Nonce' })
  nonce: string;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: string;
}

export class TelebirrQRCodeRequestDto {
  @ApiProperty({ description: 'Amount in ETB cents' })
  @IsNumber()
  @Min(1)
  totalAmount: number;

  @ApiProperty({ description: 'Payment subject/description' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Out trade number (transaction reference)' })
  @IsString()
  @IsNotEmpty()
  outTradeNo: string;

  @ApiProperty({ description: 'Short code for payment', default: '1001' })
  @IsString()
  @IsOptional()
  shortCode?: string = '1001';
}

export class BoAPaymentRequestDto {
  @ApiProperty({ description: 'Amount in ETB cents' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string = 'ETB';

  @ApiProperty({ description: 'Transaction ID' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ description: 'Payment description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ description: 'Customer phone number' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ description: 'Branch code', default: '001' })
  @IsString()
  @IsOptional()
  branchCode?: string = '001';
}

export class BoAWebhookDto {
  @ApiProperty({ description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ description: 'Payment status' })
  status: string;

  @ApiProperty({ description: 'Amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Reference number' })
  referenceNumber: string;

  @ApiProperty({ description: 'Transaction time' })
  transactionTime: string;

  @ApiProperty({ description: 'Signature' })
  signature: string;

  @ApiProperty({ description: 'Merchant ID' })
  merchantId: string;

  @ApiProperty({ description: 'Nonce' })
  nonce: string;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: string;
}

export class BoAQRCodeRequestDto {
  @ApiProperty({ description: 'Amount in ETB cents' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'ETB' })
  @IsString()
  @IsOptional()
  currency?: string = 'ETB';

  @ApiProperty({ description: 'Transaction ID' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ description: 'Payment description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Branch code', default: '001' })
  @IsString()
  @IsOptional()
  branchCode?: string = '001';
}
