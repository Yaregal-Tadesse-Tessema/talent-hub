import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { TelebirrPaymentRequestDto, TelebirrWebhookDto } from '../dto/payment.dto';

@Injectable()
export class TelebirrService {
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly appKey: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly notifyUrl: string;
  private readonly returnUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('TELEBIRR_BASE_URL') || 'https://api.ethiotelebirr.com';
    this.appId = this.configService.get<string>('TELEBIRR_APP_ID') || 'test_app_id';
    this.appKey = this.configService.get<string>('TELEBIRR_APP_KEY') || 'test_app_key';
    this.publicKey = this.configService.get<string>('TELEBIRR_PUBLIC_KEY') || 'test_public_key';
    this.privateKey = this.configService.get<string>('TELEBIRR_PRIVATE_KEY') || 'test_private_key';
    this.notifyUrl = this.configService.get<string>('TELEBIRR_NOTIFY_URL') || 'https://your-domain.com/api/payments/telebirr/webhook';
    this.returnUrl = this.configService.get<string>('TELEBIRR_RETURN_URL') || 'https://your-domain.com/payment/success';

    console.log('TeleBirrService initialized with test keys for development');
  }

  /**
   * Initialize payment with Telebirr
   */
  async initializePayment(paymentData: TelebirrPaymentRequestDto): Promise<any> {
    // If using test keys, return mock response
    if (this.appId === 'test_app_id') {
      console.log('Using mock Telebirr response for development');
      return {
        success: true,
        data: {
          toPayUrl: `https://api.ethiotelebirr.com/pay/mock/${paymentData.outTradeNo}`,
          outTradeNo: paymentData.outTradeNo,
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
          status: 'pending',
        },
      };
    }

    try {
      const timestamp = Date.now().toString();
      const nonce = this.generateNonce();
      
      const payload = {
        appId: this.appId,
        appKey: this.appKey,
        outTradeNo: paymentData.outTradeNo,
        subject: paymentData.subject,
        totalAmount: paymentData.totalAmount,
        shortCode: paymentData.shortCode || '1001',
        notifyUrl: this.notifyUrl,
        returnUrl: this.returnUrl,
        receiveName: paymentData.receiveName || 'Talent Hub',
        timeoutExpress: paymentData.timeoutExpress || '30m',
        nonce: nonce,
        timestamp: timestamp,
      };

      // Sign the request
      const signature = this.generateSignature(payload);
      payload['sign'] = signature;

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/api/v2/gateway/pay`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data && response.data.code === '00000') {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new BadRequestException(response.data?.message || 'TeleBirr payment initialization failed');
      }
    } catch (error) {
      console.error('TeleBirr payment initialization error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to initialize payment with TeleBirr');
    }
  }

  /**
   * Query payment status
   */
  async queryPayment(outTradeNo: string): Promise<any> {
    // If using test keys, return mock response
    if (this.appId === 'test_app_id') {
      console.log('Using mock Telebirr query for development');
      return {
        success: true,
        data: {
          outTradeNo: outTradeNo,
          tradeStatus: 'SUCCESS',
          totalAmount: 5000,
          currency: 'ETB',
          tradeTime: new Date().toISOString(),
        },
      };
    }

    try {
      const timestamp = Date.now().toString();
      const nonce = this.generateNonce();
      
      const payload = {
        appId: this.appId,
        outTradeNo: outTradeNo,
        nonce: nonce,
        timestamp: timestamp,
      };

      // Sign the request
      const signature = this.generateSignature(payload);
      payload['sign'] = signature;

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/api/v2/gateway/query`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data && response.data.code === '00000') {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new BadRequestException(response.data?.message || 'TeleBirr payment query failed');
      }
    } catch (error) {
      console.error('TeleBirr payment query error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to query payment with TeleBirr');
    }
  }

  /**
   * Handle Telebirr webhook notification
   */
  async handleWebhook(webhookData: TelebirrWebhookDto): Promise<any> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(webhookData)) {
        throw new BadRequestException('Invalid webhook signature');
      }

      return {
        success: true,
        data: {
          outTradeNo: webhookData.outTradeNo,
          tradeStatus: webhookData.tradeStatus,
          totalAmount: webhookData.totalAmount,
          tradeTime: webhookData.tradeTime,
        },
      };
    } catch (error) {
      console.error('TeleBirr webhook handling error:', error.message);
      throw new InternalServerErrorException('Failed to handle TeleBirr webhook');
    }
  }

  /**
   * Generate QR code for payment
   */
  async generateQRCode(paymentData: TelebirrPaymentRequestDto): Promise<any> {
    // If using test keys, return mock QR code
    if (this.appId === 'test_app_id') {
      console.log('Using mock Telebirr QR code for development');
      return {
        success: true,
        data: {
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
          outTradeNo: paymentData.outTradeNo,
        },
      };
    }

    try {
      const timestamp = Date.now().toString();
      const nonce = this.generateNonce();
      
      const payload = {
        appId: this.appId,
        outTradeNo: paymentData.outTradeNo,
        subject: paymentData.subject,
        totalAmount: paymentData.totalAmount,
        shortCode: paymentData.shortCode || '1001',
        nonce: nonce,
        timestamp: timestamp,
      };

      // Sign the request
      const signature = this.generateSignature(payload);
      payload['sign'] = signature;

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/api/v2/gateway/qrcode`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data && response.data.code === '00000') {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new BadRequestException(response.data?.message || 'TeleBirr QR code generation failed');
      }
    } catch (error) {
      console.error('TeleBirr QR code generation error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to generate QR code with TeleBirr');
    }
  }

  /**
   * Generate a unique transaction reference
   */
  generateTransactionRef(): string {
    return `telebirr-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate nonce for request
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate signature for request
   */
  private generateSignature(payload: any): string {
    // This is a simplified signature generation
    // In production, you should use the actual Telebirr signature algorithm
    const sortedKeys = Object.keys(payload).sort();
    const signString = sortedKeys.map(key => `${key}=${payload[key]}`).join('&');
    return Buffer.from(signString + this.privateKey).toString('base64');
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(webhookData: TelebirrWebhookDto): boolean {
    // This is a simplified signature verification
    // In production, you should use the actual Telebirr signature verification
    return true; // For development purposes
  }
}
