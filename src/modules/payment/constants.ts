/* eslint-disable prettier/prettier */

export const PAYMENT_CONSTANTS = {
  // Payment amounts in ETB cents
  JOB_POSTING_FEE: 5000, // 50 ETB
  FEATURED_JOB_FEE: 10000, // 100 ETB
  PREMIUM_USER_MONTHLY: 15000, // 150 ETB
  PREMIUM_USER_YEARLY: 150000, // 1500 ETB
  APPLICATION_FEE: 2000, // 20 ETB
  
  // Payment timeouts
  PAYMENT_TIMEOUT_HOURS: 24,
  
  // Chapa configuration
  CHAPA_CURRENCY: 'ETB',
  CHAPA_BASE_URL: 'https://api.chapa.co/v1',
  
  // Telebirr configuration
  TELEBIRR_CURRENCY: 'ETB',
  TELEBIRR_BASE_URL: 'https://api.ethiotelebirr.com',
  TELEBIRR_SHORT_CODE: '1001',
  TELEBIRR_TIMEOUT: '30m',
  
  // Bank of Abyssinia configuration
  BOA_CURRENCY: 'ETB',
  BOA_BASE_URL: 'https://api.bankofabyssinia.com',
  BOA_BRANCH_CODE: '001',
  BOA_TIMEOUT: '30m',
  
  // Webhook events
  WEBHOOK_EVENTS: {
    PAYMENT_SUCCESS: 'charge.completed',
    PAYMENT_FAILED: 'charge.failed',
    PAYMENT_PENDING: 'charge.pending',
    // Telebirr webhook events
    TELEBIRR_SUCCESS: 'SUCCESS',
    TELEBIRR_FAILED: 'FAILED',
    TELEBIRR_PENDING: 'PENDING',
    // Bank of Abyssinia webhook events
    BOA_SUCCESS: 'SUCCESS',
    BOA_FAILED: 'FAILED',
    BOA_PENDING: 'PENDING',
  },
  
  // Payment descriptions
  DESCRIPTIONS: {
    JOB_POSTING: 'Job posting fee',
    FEATURED_JOB: 'Featured job posting fee',
    PREMIUM_USER: 'Premium user subscription',
    APPLICATION_FEE: 'Job application fee',
  },
} as const;

export const PAYMENT_ERRORS = {
  INVALID_AMOUNT: 'Invalid payment amount',
  PAYMENT_NOT_FOUND: 'Payment not found',
  PAYMENT_ALREADY_COMPLETED: 'Payment already completed',
  PAYMENT_EXPIRED: 'Payment has expired',
  REFUND_AMOUNT_EXCEEDED: 'Refund amount cannot exceed payment amount',
  CHAPA_INITIALIZATION_FAILED: 'Failed to initialize payment with Chapa',
  CHAPA_VERIFICATION_FAILED: 'Failed to verify payment with Chapa',
  TELEBIRR_INITIALIZATION_FAILED: 'Failed to initialize payment with Telebirr',
  TELEBIRR_VERIFICATION_FAILED: 'Failed to verify payment with Telebirr',
  TELEBIRR_QR_GENERATION_FAILED: 'Failed to generate QR code with Telebirr',
  BOA_INITIALIZATION_FAILED: 'Failed to initialize payment with Bank of Abyssinia',
  BOA_VERIFICATION_FAILED: 'Failed to verify payment with Bank of Abyssinia',
  BOA_QR_GENERATION_FAILED: 'Failed to generate QR code with Bank of Abyssinia',
  BOA_METHODS_FAILED: 'Failed to get payment methods from Bank of Abyssinia',
  WEBHOOK_VALIDATION_FAILED: 'Webhook validation failed',
} as const;
