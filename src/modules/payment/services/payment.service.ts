/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity, PaymentStatus, PaymentMethod } from '../entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto, ChapaPaymentRequestDto, TelebirrPaymentRequestDto, TelebirrQRCodeRequestDto, BoAPaymentRequestDto, BoAQRCodeRequestDto } from '../dto/payment.dto';
import { ChapaService } from './chapa.service';
import { TelebirrService } from './telebirr.service';
import { BankOfAbyssiniaService } from './bank-of-abyssinia.service';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    private readonly chapaService: ChapaService,
    private readonly telebirrService: TelebirrService,
    private readonly bankOfAbyssiniaService: BankOfAbyssiniaService,
  ) {}

  /**
   * Create a new payment
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto & { checkoutUrl?: string }> {
    const transactionId = this.chapaService.generateTransactionRef();
    
    const payment = new PaymentEntity();
    payment.transactionId = transactionId;
    payment.amount = createPaymentDto.amount;
    payment.currency = createPaymentDto.currency || 'ETB';
    payment.paymentMethod = createPaymentDto.paymentMethod;
    payment.paymentType = createPaymentDto.paymentType;
    payment.description = createPaymentDto.description;
    payment.customerEmail = createPaymentDto.customerEmail;
    payment.customerPhone = createPaymentDto.customerPhone;
    payment.customerName = createPaymentDto.customerName;
    payment.referenceId = createPaymentDto.referenceId;
    payment.referenceType = createPaymentDto.referenceType;
    payment.userId = createPaymentDto.userId;
    payment.tenantId = createPaymentDto.tenantId;
    payment.status = PaymentStatus.PENDING;
    payment.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const savedPayment = await this.paymentRepository.save(payment);

    // Initialize payment with Chapa
    if (createPaymentDto.paymentMethod === PaymentMethod.CHAPA) {
      const chapaRequest: ChapaPaymentRequestDto = {
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'ETB',
        customer_email: createPaymentDto.customerEmail || '',
        customer_name: createPaymentDto.customerName || '',
        customer_phone: createPaymentDto.customerPhone,
        tx_ref: transactionId,
        description: createPaymentDto.description,
        callback_url: `${process.env.APP_URL}/api/payment/webhook`,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
      };

      try {
        const chapaResponse = await this.chapaService.initializePayment(chapaRequest);
        
        if (chapaResponse.success) {
          payment.chapaReference = chapaResponse.transaction_ref;
          payment.status = PaymentStatus.PROCESSING;
          await this.paymentRepository.save(payment);
          
          return {
            ...this.toResponseDto(savedPayment),
            checkoutUrl: chapaResponse.checkout_url,
          };
        }
      } catch (error) {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = error.message;
        await this.paymentRepository.save(payment);
        throw error;
      }
    }

    // Initialize payment with Telebirr
    if (createPaymentDto.paymentMethod === PaymentMethod.TELEBIRR) {
      const telebirrRequest: TelebirrPaymentRequestDto = {
        totalAmount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'ETB',
        subject: createPaymentDto.description || 'Payment',
        outTradeNo: transactionId,
        customerPhone: createPaymentDto.customerPhone,
        customerName: createPaymentDto.customerName,
        receiveName: 'Talent Hub',
      };

      try {
        const telebirrResponse = await this.telebirrService.initializePayment(telebirrRequest);
        
        if (telebirrResponse.success) {
          payment.chapaReference = telebirrResponse.data.outTradeNo; // Reusing chapaReference field for Telebirr reference
          payment.status = PaymentStatus.PROCESSING;
          await this.paymentRepository.save(payment);
          
          return {
            ...this.toResponseDto(savedPayment),
            checkoutUrl: telebirrResponse.data.toPayUrl,
          };
        }
      } catch (error) {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = error.message;
        await this.paymentRepository.save(payment);
        throw error;
      }
    }

    // Initialize payment with Bank of Abyssinia
    if (createPaymentDto.paymentMethod === PaymentMethod.BANK_OF_ABYSSINIA) {
      const boaRequest: BoAPaymentRequestDto = {
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'ETB',
        transactionId: transactionId,
        description: createPaymentDto.description || 'Payment',
        customerName: createPaymentDto.customerName,
        customerEmail: createPaymentDto.customerEmail,
        customerPhone: createPaymentDto.customerPhone,
      };

      try {
        const boaResponse = await this.bankOfAbyssiniaService.initializePayment(boaRequest);
        
        if (boaResponse.success) {
          payment.chapaReference = boaResponse.data.transactionId; // Reusing chapaReference field for BoA reference
          payment.status = PaymentStatus.PROCESSING;
          await this.paymentRepository.save(payment);
          
          return {
            ...this.toResponseDto(savedPayment),
            checkoutUrl: boaResponse.data.paymentUrl,
          };
        }
      } catch (error) {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = error.message;
        await this.paymentRepository.save(payment);
        throw error;
      }
    }

    return this.toResponseDto(savedPayment);
  }

  /**
   * Get all payments with pagination
   */
  async getAllPayments(query: CollectionQuery): Promise<{ items: PaymentResponseDto[]; total: number }> {
    const [payments, total] = await this.paymentRepository.findAndCount({
      where: query.where ? this.buildWhereClause(query.where) : {},
      order: query.orderBy ? this.buildOrderClause(query.orderBy) : { createdAt: 'DESC' },
      skip: query.skip || 0,
      take: query.take || 10,
    });

    return {
      items: payments.map(payment => this.toResponseDto(payment)),
      total,
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.toResponseDto(payment);
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { transactionId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.toResponseDto(payment);
  }

  /**
   * Update payment status
   */
  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    Object.assign(payment, updatePaymentDto);
    
    if (updatePaymentDto.status === PaymentStatus.COMPLETED) {
      payment.completedAt = new Date();
    }

    const updatedPayment = await this.paymentRepository.save(payment);
    return this.toResponseDto(updatedPayment);
  }

  /**
   * Verify payment with Chapa
   */
  async verifyPayment(transactionId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { transactionId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    try {
      const verification = await this.chapaService.verifyPayment(transactionId);
      
      if (verification.success) {
        payment.status = PaymentStatus.COMPLETED;
        payment.completedAt = new Date();
        payment.chapaResponse = verification.data;
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = verification.message;
      }

      const updatedPayment = await this.paymentRepository.save(payment);
      return this.toResponseDto(updatedPayment);
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      await this.paymentRepository.save(payment);
      throw error;
    }
  }

  /**
   * Process webhook from Chapa
   */
  async processWebhook(webhookData: any): Promise<void> {
    const transactionRef = webhookData.data.tx_ref;
    const payment = await this.paymentRepository.findOne({ where: { transactionId: transactionRef } });
    
    if (!payment) {
      throw new NotFoundException('Payment not found for webhook');
    }

    payment.webhookData = webhookData;
    payment.chapaReference = webhookData.data.tx_ref;

    if (webhookData.data.status === 'success') {
      payment.status = PaymentStatus.COMPLETED;
      payment.completedAt = new Date();
    } else if (webhookData.data.status === 'failed') {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'Payment failed via webhook';
    }

    await this.paymentRepository.save(payment);
  }

  /**
   * Refund payment
   */
  async refundPayment(id: string, refundAmount: number, refundReason: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    payment.refundAmount = refundAmount;
    payment.refundReason = refundReason;
    payment.refundedAt = new Date();
    payment.status = PaymentStatus.REFUNDED;

    const updatedPayment = await this.paymentRepository.save(payment);
    return this.toResponseDto(updatedPayment);
  }

  /**
   * Get payments by user
   */
  async getPaymentsByUser(userId: string, query: CollectionQuery): Promise<{ items: PaymentResponseDto[]; total: number }> {
    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { userId, ...(query.where ? this.buildWhereClause(query.where) : {}) },
      order: query.orderBy ? this.buildOrderClause(query.orderBy) : { createdAt: 'DESC' },
      skip: query.skip || 0,
      take: query.take || 10,
    });

    return {
      items: payments.map(payment => this.toResponseDto(payment)),
      total,
    };
  }

  /**
   * Get payments by tenant
   */
  async getPaymentsByTenant(tenantId: string, query: CollectionQuery): Promise<{ items: PaymentResponseDto[]; total: number }> {
    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { tenantId, ...(query.where ? this.buildWhereClause(query.where) : {}) },
      order: query.orderBy ? this.buildOrderClause(query.orderBy) : { createdAt: 'DESC' },
      skip: query.skip || 0,
      take: query.take || 10,
    });

    return {
      items: payments.map(payment => this.toResponseDto(payment)),
      total,
    };
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(payment: PaymentEntity): PaymentResponseDto {
    return {
      id: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentType: payment.paymentType,
      description: payment.description,
      customerEmail: payment.customerEmail,
      customerPhone: payment.customerPhone,
      customerName: payment.customerName,
      chapaReference: payment.chapaReference,
      failureReason: payment.failureReason,
      refundAmount: payment.refundAmount,
      refundReason: payment.refundReason,
      refundedAt: payment.refundedAt,
      completedAt: payment.completedAt,
      expiresAt: payment.expiresAt,
      referenceId: payment.referenceId,
      referenceType: payment.referenceType,
      userId: payment.userId,
      tenantId: payment.tenantId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  /**
   * Generate Telebirr QR code for payment
   */
  async generateTeleBirrQRCode(qrCodeRequest: TelebirrQRCodeRequestDto): Promise<any> {
    try {
      const qrResponse = await this.telebirrService.generateQRCode(qrCodeRequest);
      return qrResponse;
    } catch (error) {
      throw new BadRequestException('Failed to generate Telebirr QR code');
    }
  }

  /**
   * Query Telebirr payment status
   */
  async queryTeleBirrPayment(outTradeNo: string): Promise<any> {
    try {
      const queryResponse = await this.telebirrService.queryPayment(outTradeNo);
      return queryResponse;
    } catch (error) {
      throw new BadRequestException('Failed to query Telebirr payment');
    }
  }

  /**
   * Handle Telebirr webhook
   */
  async handleTeleBirrWebhook(webhookData: any): Promise<any> {
    try {
      const webhookResponse = await this.telebirrService.handleWebhook(webhookData);
      
      // Update payment status based on webhook
      const payment = await this.paymentRepository.findOne({
        where: { chapaReference: webhookData.outTradeNo } // Reusing chapaReference field
      });

      if (payment) {
        if (webhookData.tradeStatus === 'SUCCESS') {
          payment.status = PaymentStatus.COMPLETED;
          payment.completedAt = new Date();
        } else if (webhookData.tradeStatus === 'FAILED') {
          payment.status = PaymentStatus.FAILED;
          payment.failureReason = 'Payment failed via Telebirr';
        }
        
        await this.paymentRepository.save(payment);
      }

      return webhookResponse;
    } catch (error) {
      throw new BadRequestException('Failed to handle Telebirr webhook');
    }
  }

  /**
   * Generate Bank of Abyssinia QR code for payment
   */
  async generateBoAQRCode(qrCodeRequest: BoAQRCodeRequestDto): Promise<any> {
    try {
      const qrResponse = await this.bankOfAbyssiniaService.generateQRCode(qrCodeRequest);
      return qrResponse;
    } catch (error) {
      throw new BadRequestException('Failed to generate Bank of Abyssinia QR code');
    }
  }

  /**
   * Query Bank of Abyssinia payment status
   */
  async queryBoAPayment(transactionId: string): Promise<any> {
    try {
      const queryResponse = await this.bankOfAbyssiniaService.queryPayment(transactionId);
      return queryResponse;
    } catch (error) {
      throw new BadRequestException('Failed to query Bank of Abyssinia payment');
    }
  }

  /**
   * Get Bank of Abyssinia payment methods
   */
  async getBoAPaymentMethods(): Promise<any> {
    try {
      const methodsResponse = await this.bankOfAbyssiniaService.getPaymentMethods();
      return methodsResponse;
    } catch (error) {
      throw new BadRequestException('Failed to get Bank of Abyssinia payment methods');
    }
  }

  /**
   * Handle Bank of Abyssinia webhook
   */
  async handleBoAWebhook(webhookData: any): Promise<any> {
    try {
      const webhookResponse = await this.bankOfAbyssiniaService.handleWebhook(webhookData);
      
      // Update payment status based on webhook
      const payment = await this.paymentRepository.findOne({
        where: { chapaReference: webhookData.transactionId } // Reusing chapaReference field
      });

      if (payment) {
        if (webhookData.status === 'SUCCESS') {
          payment.status = PaymentStatus.COMPLETED;
          payment.completedAt = new Date();
        } else if (webhookData.status === 'FAILED') {
          payment.status = PaymentStatus.FAILED;
          payment.failureReason = 'Payment failed via Bank of Abyssinia';
        }
        
        await this.paymentRepository.save(payment);
      }

      return webhookResponse;
    } catch (error) {
      throw new BadRequestException('Failed to handle Bank of Abyssinia webhook');
    }
  }

  /**
   * Build where clause from query
   */
  private buildWhereClause(where: any): any {
    if (!where || !Array.isArray(where)) {
      return {};
    }

    const whereClause: any = {};
    
    where.forEach((condition: any) => {
      if (Array.isArray(condition) && condition.length >= 3) {
        const [column, operator, value] = condition;
        whereClause[column] = value;
      }
    });

    return whereClause;
  }

  /**
   * Build order clause from query
   */
  private buildOrderClause(order: any): any {
    if (!order) {
      return { createdAt: 'DESC' };
    }

    if (typeof order === 'string') {
      return { [order]: 'DESC' };
    }

    if (typeof order === 'object') {
      return order;
    }

    return { createdAt: 'DESC' };
  }
}
