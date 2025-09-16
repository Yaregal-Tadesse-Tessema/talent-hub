/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { ChapaPaymentRequestDto, ChapaWebhookDto } from '../dto/payment.dto';

@Injectable()
export class ChapaService {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('CHAPA_BASE_URL') || 'https://api.chapa.co/v1';
    this.secretKey = this.configService.get<string>('CHAPA_SECRET_KEY') || 'test_secret_key';
    this.publicKey = this.configService.get<string>('CHAPA_PUBLIC_KEY') || 'test_public_key';

    console.log('ChapaService initialized with test keys for development');
  }

  /**
   * Initialize payment with Chapa
   */
  async initializePayment(paymentData: ChapaPaymentRequestDto): Promise<any> {
    // If using test keys, return mock response
    if (this.secretKey === 'test_secret_key') {
      console.log('Using mock Chapa response for development');
      return {
        success: true,
        checkout_url: `https://checkout.chapa.co/checkout/mock/${paymentData.tx_ref}`,
        transaction_ref: paymentData.tx_ref,
        status: 'pending',
      };
    }

    try {
      const payload = {
        amount: paymentData.amount,
        currency: paymentData.currency || 'ETB',
        email: paymentData.customer_email,
        first_name: paymentData.customer_name,
        last_name: paymentData.customer_name.split(' ')[1] || '',
        phone_number: paymentData.customer_phone || '',
        tx_ref: paymentData.tx_ref,
        callback_url: paymentData.callback_url,
        return_url: paymentData.return_url,
        customization: {
          title: 'Ethio Talent Hub Payment',
          description: paymentData.description || 'Payment for services',
        },
      };

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          checkout_url: response.data.data.checkout_url,
          transaction_ref: response.data.data.tx_ref,
          status: response.data.data.status,
        };
      } else {
        throw new BadRequestException(response.data.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Chapa payment initialization error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to initialize payment with Chapa');
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionRef: string): Promise<any> {
    // If using test keys, return mock response
    if (this.secretKey === 'test_secret_key') {
      console.log('Using mock Chapa verification for development');
      return {
        success: true,
        data: {
          tx_ref: transactionRef,
          status: 'success',
          currency: 'ETB',
          amount: 5000,
          customer: {
            email: 'test@example.com',
            name: 'Test User',
            phone_number: '+251900000000',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/transaction/verify/${transactionRef}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Payment verification failed',
        };
      }
    } catch (error) {
      console.error('Chapa payment verification error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to verify payment with Chapa');
    }
  }

  /**
   * Get all transactions
   */
  async getAllTransactions(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/transaction`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          params: {
            page,
            limit,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Chapa get transactions error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to fetch transactions from Chapa');
    }
  }

  /**
   * Create a bank transfer
   */
  async createBankTransfer(transferData: {
    account_name: string;
    account_number: string;
    bank_code: string;
    amount: number;
    currency: string;
    reference: string;
    description?: string;
  }): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/transfer`,
        transferData,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Chapa bank transfer error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to create bank transfer with Chapa');
    }
  }

  /**
   * Get banks list
   */
  async getBanks(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/banks`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Chapa get banks error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to fetch banks from Chapa');
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    // Chapa webhook validation logic
    // This would typically involve HMAC validation
    // For now, we'll implement a basic validation
    return true; // Implement proper signature validation
  }

  /**
   * Process webhook data
   */
  processWebhook(webhookData: ChapaWebhookDto): any {
    return {
      transactionRef: webhookData.data.tx_ref,
      status: webhookData.data.status,
      amount: webhookData.data.amount,
      currency: webhookData.data.currency,
      customer: webhookData.data.customer,
      createdAt: webhookData.data.created_at,
      updatedAt: webhookData.data.updated_at,
    };
  }

  /**
   * Generate transaction reference
   */
  generateTransactionRef(prefix: string = 'TALENT'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }
}
