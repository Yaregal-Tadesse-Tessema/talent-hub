# Payment Integrations Overview

This document provides a comprehensive overview of all payment integrations available in the Talent Hub payment module.

## Available Payment Methods

The Talent Hub payment module supports three major Ethiopian payment providers:

1. **Chapa** - Digital payment gateway
2. **TeleBirr** - Mobile money service
3. **Bank of Abyssinia** - Commercial bank services

## Unified Payment API

All payment methods use the same unified API endpoint with different `paymentMethod` values:

### Create Payment

**POST** `/api/payments`

```json
{
  "amount": 5000,
  "currency": "ETB",
  "paymentMethod": "chapa|telebirr|bank_of_abyssinia",
  "paymentType": "job_posting|premium_subscription|application_fee|featured_job|premium_user",
  "description": "Payment description",
  "customerEmail": "user@example.com",
  "customerPhone": "+251900000000",
  "customerName": "John Doe"
}
```

## Payment Method Comparison

| Feature | Chapa | TeleBirr | Bank of Abyssinia |
|---------|-------|----------|-------------------|
| **Payment Types** | Digital Gateway | Mobile Money | Bank Services |
| **QR Code** | ✅ | ✅ | ✅ |
| **Webhook** | ✅ | ✅ | ✅ |
| **Status Query** | ✅ | ✅ | ✅ |
| **Mobile App** | ❌ | ✅ | ✅ |
| **Internet Banking** | ❌ | ❌ | ✅ |
| **ATM Support** | ❌ | ❌ | ✅ |
| **Branch Support** | ❌ | ❌ | ✅ |
| **Mock Mode** | ✅ | ✅ | ✅ |

## Configuration

### Environment Variables

```env
# Chapa Configuration
CHAPA_BASE_URL=https://api.chapa.co/v1
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key

# Telebirr Configuration
TELEBIRR_BASE_URL=https://api.ethiotelebirr.com
TELEBIRR_APP_ID=your_app_id
TELEBIRR_APP_KEY=your_app_key
TELEBIRR_PUBLIC_KEY=your_public_key
TELEBIRR_PRIVATE_KEY=your_private_key
TELEBIRR_SHORT_CODE=1001

# Bank of Abyssinia Configuration
BOA_BASE_URL=https://api.bankofabyssinia.com
BOA_MERCHANT_ID=your_merchant_id
BOA_API_KEY=your_api_key
BOA_SECRET_KEY=your_secret_key
BOA_BRANCH_CODE=001

# Webhook URLs
CHAPA_NOTIFY_URL=https://your-domain.com/api/payments/chapa/webhook
TELEBIRR_NOTIFY_URL=https://your-domain.com/api/payments/telebirr/webhook
BOA_NOTIFY_URL=https://your-domain.com/api/payments/boa/webhook

# Return URLs
CHAPA_RETURN_URL=https://your-domain.com/payment/success
TELEBIRR_RETURN_URL=https://your-domain.com/payment/success
BOA_RETURN_URL=https://your-domain.com/payment/success
```

## API Endpoints

### Payment Creation
- **POST** `/api/payments` - Create payment with any method

### Chapa Endpoints
- **GET** `/api/payments/chapa/verify/:txRef` - Verify Chapa payment
- **GET** `/api/payments/chapa/banks` - Get available banks
- **GET** `/api/payments/chapa/transactions` - Get Chapa transactions
- **POST** `/api/payments/chapa/webhook` - Chapa webhook

### Telebirr Endpoints
- **POST** `/api/payments/telebirr/qr-code` - Generate Telebirr QR code
- **GET** `/api/payments/telebirr/query/:outTradeNo` - Query Telebirr payment
- **POST** `/api/payments/telebirr/webhook` - Telebirr webhook

### Bank of Abyssinia Endpoints
- **POST** `/api/payments/boa/qr-code` - Generate BoA QR code
- **GET** `/api/payments/boa/query/:transactionId` - Query BoA payment
- **GET** `/api/payments/boa/payment-methods` - Get BoA payment methods
- **POST** `/api/payments/boa/webhook` - BoA webhook

## Payment Flow

### 1. Payment Initialization
```typescript
// All payment methods use the same flow
const payment = await paymentService.createPayment({
  amount: 5000,
  paymentMethod: 'chapa', // or 'telebirr' or 'bank_of_abyssinia'
  paymentType: 'job_posting',
  customerEmail: 'user@example.com'
});
```

### 2. Payment Processing
- User is redirected to the respective payment provider
- Payment is processed through the chosen method
- Status updates are received via webhooks

### 3. Status Updates
- All providers send webhook notifications
- Payment status is automatically updated
- Database reflects the current payment state

## Response Format

All payment methods return a consistent response format:

```json
{
  "id": "payment-uuid",
  "transactionId": "provider-specific-id",
  "amount": 5000,
  "currency": "ETB",
  "status": "processing|completed|failed",
  "paymentMethod": "chapa|telebirr|bank_of_abyssinia",
  "checkoutUrl": "https://provider.com/pay/...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

All integrations include comprehensive error handling:

- **Configuration Errors**: Missing or invalid credentials
- **Network Errors**: Connection issues with providers
- **Payment Failures**: Failed payment processing
- **Webhook Validation**: Invalid webhook signatures
- **Timeout Handling**: Payment timeout management

## Development Mode

All services support development mode with mock responses:

- **Chapa**: Returns mock checkout URLs and transaction references
- **TeleBirr**: Returns mock QR codes and payment URLs
- **Bank of Abyssinia**: Returns mock payment methods and transaction data

## Security Features

- **Signature Verification**: All webhooks are signature-verified
- **Environment Variables**: Sensitive data stored securely
- **HTTPS Only**: All API calls use HTTPS in production
- **API Key Authentication**: Secure authentication with providers
- **Input Validation**: Comprehensive input validation

## Monitoring and Logging

- **Payment Success Rates**: Track success rates per provider
- **Response Times**: Monitor API response times
- **Error Rates**: Track and analyze error patterns
- **Webhook Processing**: Monitor webhook success/failure rates
- **Provider Performance**: Compare provider performance

## Best Practices

1. **Provider Selection**: Choose the right provider based on user preferences
2. **Fallback Strategy**: Implement fallback to alternative providers
3. **Error Handling**: Implement comprehensive error handling
4. **Monitoring**: Set up proper monitoring and alerting
5. **Testing**: Test all integrations thoroughly
6. **Documentation**: Keep integration documentation updated
7. **Security**: Follow security best practices

## Support and Maintenance

- **Provider Support**: Contact respective providers for API issues
- **Documentation**: Refer to individual integration guides
- **Testing**: Use mock mode for development and testing
- **Monitoring**: Monitor payment flows and error rates
- **Updates**: Keep integrations updated with provider changes

## Future Enhancements

- **Additional Providers**: Support for more Ethiopian payment providers
- **Currency Support**: Multi-currency payment support
- **Subscription Management**: Recurring payment support
- **Analytics**: Advanced payment analytics and reporting
- **Mobile SDKs**: Native mobile app integration
