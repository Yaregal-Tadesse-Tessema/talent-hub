/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { ChapaService } from '../services/chapa.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto, ChapaWebhookDto, TelebirrWebhookDto, TelebirrQRCodeRequestDto, BoAWebhookDto, BoAQRCodeRequestDto } from '../dto/payment.dto';
import { AllowAnonymous } from 'src/modules/auth/allow-anonymous.decorator';
import { decodeCollectionQuery } from 'src/libs/Common/collection-query/query-converter';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { userInfo } from 'src/modules/auth/local-auth.guard';
import { UserInfo } from 'src/libs/Common/user-information';

@Controller('payments')
@ApiTags('Payments')
@ApiBearerAuth()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly chapaService: ChapaService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @userInfo() currentUser: UserInfo,
  ): Promise<PaymentResponseDto & { checkoutUrl?: string }> {
    // Set user and tenant from current user context
    createPaymentDto.currentUser = currentUser
    createPaymentDto.tenantId = currentUser?.tenantId;
    return await this.paymentService.createPayment(createPaymentDto);
  }

  @Get('call-back-url')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Call back URL' })
  @ApiResponse({ status: 200, description: 'Call back URL', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async callBackUrl(
    @Query('trx_ref') trx_ref: string,
    @Query('ref_id') ref_id: string,
    @Query('status') status: string,
  ): Promise<any> {
    return await this.paymentService.callBackUrl({ trx_ref, ref_id, status });
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getAllPayments(@Query('q') q?: string): Promise<{ items: PaymentResponseDto[]; total: number }> {
    const query = decodeCollectionQuery(q);
    return await this.paymentService.getAllPayments(query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payments by user' })
  @ApiResponse({ status: 200, description: 'User payments retrieved successfully' })
  async getPaymentsByUser(
    @Param('userId') userId: string,
    @Query('q') q?: string,
  ): Promise<{ items: PaymentResponseDto[]; total: number }> {
    const query = decodeCollectionQuery(q);
    return await this.paymentService.getPaymentsByUser(userId, query);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get payments by tenant' })
  @ApiResponse({ status: 200, description: 'Tenant payments retrieved successfully' })
  async getPaymentsByTenant(
    @Param('tenantId') tenantId: string,
    @Query('q') q?: string,
  ): Promise<{ items: PaymentResponseDto[]; total: number }> {
    const query = decodeCollectionQuery(q);
    return await this.paymentService.getPaymentsByTenant(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('id') id: string): Promise<PaymentResponseDto> {
    return await this.paymentService.getPaymentById(id);
  }

  @Get('transaction/:transactionId')
  @ApiOperation({ summary: 'Get payment by transaction ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentByTransactionId(@Param('transactionId') transactionId: string): Promise<PaymentResponseDto> {
    return await this.paymentService.getPaymentByTransactionId(transactionId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.updatePayment(id, updatePaymentDto);
  }

  @Post(':transactionId/verify')
  @ApiOperation({ summary: 'Verify payment with Chapa' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async verifyPayment(@Param('transactionId') transactionId: string): Promise<PaymentResponseDto> {
    return await this.paymentService.verifyPayment(transactionId);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async refundPayment(
    @Param('id') id: string,
    @Body() refundData: { amount: number; reason: string },
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.refundPayment(id, refundData.amount, refundData.reason);
  }

  @Post('webhook')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chapa webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() webhookData: ChapaWebhookDto): Promise<{ message: string }> {
    try {
      await this.paymentService.processWebhook(webhookData);
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { message: 'Webhook processing failed' };
    }
  }

  @Get('chapa/banks')
  @ApiOperation({ summary: 'Get available banks from Chapa' })
  @ApiResponse({ status: 200, description: 'Banks retrieved successfully' })
  async getBanks(): Promise<any> {
    return await this.chapaService.getBanks();
  }

  @Get('chapa/transactions')
  @ApiOperation({ summary: 'Get transactions from Chapa' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getChapaTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    return await this.chapaService.getAllTransactions(page, limit);
  }

  // Telebirr endpoints
  @Post('telebirr/qr-code')
  @ApiOperation({ summary: 'Generate Telebirr QR code for payment' })
  @ApiResponse({ status: 201, description: 'QR code generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async generateTeleBirrQRCode(
    @Body() qrCodeRequest: TelebirrQRCodeRequestDto,
  ): Promise<any> {
    return await this.paymentService.generateTeleBirrQRCode(qrCodeRequest);
  }

  @Get('telebirr/query/:outTradeNo')
  @ApiOperation({ summary: 'Query Telebirr payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async queryTeleBirrPayment(@Param('outTradeNo') outTradeNo: string): Promise<any> {
    return await this.paymentService.queryTeleBirrPayment(outTradeNo);
  }

  @Post('telebirr/webhook')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Telebirr webhook notification' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handleTeleBirrWebhook(@Body() webhookData: TelebirrWebhookDto): Promise<any> {
    return await this.paymentService.handleTeleBirrWebhook(webhookData);
  }

  // Bank of Abyssinia endpoints
  @Post('boa/qr-code')
  @ApiOperation({ summary: 'Generate Bank of Abyssinia QR code for payment' })
  @ApiResponse({ status: 201, description: 'QR code generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async generateBoAQRCode(
    @Body() qrCodeRequest: BoAQRCodeRequestDto,
  ): Promise<any> {
    return await this.paymentService.generateBoAQRCode(qrCodeRequest);
  }

  @Get('boa/query/:transactionId')
  @ApiOperation({ summary: 'Query Bank of Abyssinia payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async queryBoAPayment(@Param('transactionId') transactionId: string): Promise<any> {
    return await this.paymentService.queryBoAPayment(transactionId);
  }

  @Get('boa/payment-methods')
  @ApiOperation({ summary: 'Get available Bank of Abyssinia payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getBoAPaymentMethods(): Promise<any> {
    return await this.paymentService.getBoAPaymentMethods();
  }

  @Post('boa/webhook')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Bank of Abyssinia webhook notification' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handleBoAWebhook(@Body() webhookData: BoAWebhookDto): Promise<any> {
    return await this.paymentService.handleBoAWebhook(webhookData);
  }
}
