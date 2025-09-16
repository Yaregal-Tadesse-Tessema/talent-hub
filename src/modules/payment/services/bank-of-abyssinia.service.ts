import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { BoAPaymentRequestDto, BoAWebhookDto, BoAQRCodeRequestDto } from '../dto/payment.dto';

@Injectable()
export class BankOfAbyssiniaService {
  private readonly baseUrl: string;
  private readonly merchantId: string;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly notifyUrl: string;
  private readonly returnUrl: string;
  private readonly branchCode: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('BOA_BASE_URL') || 'https://api.bankofabyssinia.com';
    this.merchantId = this.configService.get<string>('BOA_MERCHANT_ID') || 'test_merchant_id';
    this.apiKey = this.configService.get<string>('BOA_API_KEY') || 'test_api_key';
    this.secretKey = this.configService.get<string>('BOA_SECRET_KEY') || 'test_secret_key';
    this.notifyUrl = this.configService.get<string>('BOA_NOTIFY_URL') || 'https://your-domain.com/api/payments/boa/webhook';
    this.returnUrl = this.configService.get<string>('BOA_RETURN_URL') || 'https://your-domain.com/payment/success';
    this.branchCode = this.configService.get<string>('BOA_BRANCH_CODE') || '001';

    console.log('BankOfAbyssiniaService initialized with test keys for development');
  }

  /**
   * Initialize payment with Bank of Abyssinia
   */
  async initializePayment(paymentData: BoAPaymentRequestDto): Promise<any> {
    // If using test keys, return mock response
    if (this.merchantId === 'test_merchant_id') {
      console.log('Using mock BoA response for development');
      return {
        success: true,
        data: {
          paymentUrl: `https://api.bankofabyssinia.com/pay/mock/${paymentData.transactionId}`,
          transactionId: paymentData.transactionId,
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
          status: 'pending',
          referenceNumber: `BOA-${Date.now()}`,
        },
      };
    }

    try {
      const timestamp = Date.now().toString();
      const nonce = this.generateNonce();
      
      const payload = {
        merchantId: this.merchantId,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'ETB',
        description: paymentData.description,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,
        branchCode: this.branchCode,
        notifyUrl: this.notifyUrl,
        returnUrl: this.returnUrl,
        timestamp: timestamp,
        nonce: nonce,
      };

      // Sign the request
      const signature = this.generateSignature(payload);
      payload['signature'] = signature;

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/api/v1/payment/initialize`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new BadRequestException(response.data?.message || 'BoA payment initialization failed');
      }
    } catch (error) {
      console.error('BoA payment initialization error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to initialize payment with Bank of Abyssinia');
    }
  }

  /**
   * Query payment status
   */
  async queryPayment(transactionId: string): Promise<any> {
    // If using test keys, return mock response
    if (this.merchantId === 'test_merchant_id') {
      console.log('Using mock BoA query for development');
      return {
        success: true,
        data: {
          transactionId: transactionId,
          status: 'SUCCESS',
          amount: 5000,
          currency: 'ETB',
          transactionTime: new Date().toISOString(),
          referenceNumber: `BOA-${Date.now()}`,
        },
      };
    }

    try {
      const timestamp = Date.now().toString();
      const nonce = this.generateNonce();
      
      const payload = {
        merchantId: this.merchantId,
        transactionId: transactionId,
        timestamp: timestamp,
        nonce: nonce,
      };

      // Sign the request
      const signature = this.generateSignature(payload);
      payload['signature'] = signature;

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/api/v1/payment/query`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new BadRequestException(response.data?.message || 'BoA payment query failed');
      }
    } catch (error) {
      console.error('BoA payment query error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to query payment with Bank of Abyssinia');
    }
  }

  /**
   * Handle Bank of Abyssinia webhook notification
   */
  async handleWebhook(webhookData: BoAWebhookDto): Promise<any> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(webhookData)) {
        throw new BadRequestException('Invalid webhook signature');
      }

      return {
        success: true,
        data: {
          transactionId: webhookData.transactionId,
          status: webhookData.status,
          amount: webhookData.amount,
          referenceNumber: webhookData.referenceNumber,
          transactionTime: webhookData.transactionTime,
        },
      };
    } catch (error) {
      console.error('BoA webhook handling error:', error.message);
      throw new InternalServerErrorException('Failed to handle BoA webhook');
    }
  }

  /**
   * Generate QR code for payment
   */
  async generateQRCode(qrCodeRequest: BoAQRCodeRequestDto): Promise<any> {
    // If using test keys, return mock QR code
    if (this.merchantId === 'test_merchant_id') {
      console.log('Using mock BoA QR code for development');
      return {
        success: true,
        data: {
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
          transactionId: qrCodeRequest.transactionId,
          referenceNumber: `BOA-${Date.now()}`,
        },
      };
    }

    try {
      const timestamp = Date.now().toString();
      const nonce = this.generateNonce();
      
      const payload = {
        merchantId: this.merchantId,
        transactionId: qrCodeRequest.transactionId,
        amount: qrCodeRequest.amount,
        currency: qrCodeRequest.currency || 'ETB',
        description: qrCodeRequest.description,
        branchCode: this.branchCode,
        timestamp: timestamp,
        nonce: nonce,
      };

      // Sign the request
      const signature = this.generateSignature(payload);
      payload['signature'] = signature;

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/api/v1/payment/qrcode`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new BadRequestException(response.data?.message || 'BoA QR code generation failed');
      }
    } catch (error) {
      console.error('BoA QR code generation error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to generate QR code with Bank of Abyssinia');
    }
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<any> {
    // If using test keys, return mock response
    if (this.merchantId === 'test_merchant_id') {
      console.log('Using mock BoA payment methods for development');
      return {
        success: true,
        data: {
          methods: [
            { id: 'mobile_banking', name: 'Mobile Banking', enabled: true },
            { id: 'internet_banking', name: 'Internet Banking', enabled: true },
            { id: 'atm', name: 'ATM Payment', enabled: true },
            { id: 'branch', name: 'Branch Payment', enabled: true },
          ],
        },
      };
    }

    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/api/v1/payment/methods`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new BadRequestException(response.data?.message || 'Failed to get payment methods');
      }
    } catch (error) {
      console.error('BoA payment methods error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to get payment methods from Bank of Abyssinia');
    }
  }

  /**
   * Generate a unique transaction reference
   */
  generateTransactionRef(): string {
    return `boa-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
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
    // In production, you should use the actual BoA signature algorithm
    const sortedKeys = Object.keys(payload).sort();
    const signString = sortedKeys.map(key => `${key}=${payload[key]}`).join('&');
    return Buffer.from(signString + this.secretKey).toString('base64');
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(webhookData: BoAWebhookDto): boolean {
    // This is a simplified signature verification
    // In production, you should use the actual BoA signature verification
    return true; // For development purposes
  }
}
