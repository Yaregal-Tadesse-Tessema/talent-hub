# Bank of Abyssinia Payment Integration

This document describes the Bank of Abyssinia payment integration for the Talent Hub payment module.

## Overview

Bank of Abyssinia is one of Ethiopia's leading commercial banks offering comprehensive banking services including mobile banking, internet banking, and branch services. This integration provides seamless payment processing for the Talent Hub platform through various BoA payment channels.

## Features

- **Payment Initialization**: Create payment requests with Bank of Abyssinia
- **QR Code Generation**: Generate QR codes for easy mobile payments
- **Payment Status Query**: Check payment status in real-time
- **Webhook Support**: Handle payment notifications automatically
- **Multiple Payment Methods**: Support for mobile banking, internet banking, ATM, and branch payments
- **Mock Mode**: Development-friendly mock responses

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Bank of Abyssinia Configuration
BOA_BASE_URL=https://api.bankofabyssinia.com
BOA_MERCHANT_ID=your_merchant_id
BOA_API_KEY=your_api_key
BOA_SECRET_KEY=your_secret_key
BOA_BRANCH_CODE=001
BOA_NOTIFY_URL=https://your-domain.com/api/payments/boa/webhook
BOA_RETURN_URL=https://your-domain.com/payment/success
```

### Development Mode

For development, the service will use mock values if the environment variables are not set:
- `BOA_MERCHANT_ID` defaults to `test_merchant_id`
- `BOA_API_KEY` defaults to `test_api_key`
- `BOA_SECRET_KEY` defaults to `test_secret_key`
- `BOA_BRANCH_CODE` defaults to `001`

## API Endpoints

### 1. Create Payment with Bank of Abyssinia

**POST** `/api/payments`

```json
{
  "amount": 5000,
  "currency": "ETB",
  "paymentMethod": "bank_of_abyssinia",
  "paymentType": "job_posting",
  "description": "Job posting fee",
  "customerEmail": "user@example.com",
  "customerPhone": "+251900000000",
  "customerName": "John Doe"
}
```

**Response:**
```json
{
  "id": "payment-uuid",
  "transactionId": "boa-1234567890-abc123",
  "amount": 5000,
  "currency": "ETB",
  "status": "processing",
  "checkoutUrl": "https://api.bankofabyssinia.com/pay/mock/boa-1234567890-abc123",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Generate QR Code

**POST** `/api/payments/boa/qr-code`

```json
{
  "amount": 5000,
  "currency": "ETB",
  "transactionId": "boa-1234567890-abc123",
  "description": "Job posting fee",
  "branchCode": "001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "transactionId": "boa-1234567890-abc123",
    "referenceNumber": "BOA-1234567890"
  }
}
```

### 3. Query Payment Status

**GET** `/api/payments/boa/query/:transactionId`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "boa-1234567890-abc123",
    "status": "SUCCESS",
    "amount": 5000,
    "currency": "ETB",
    "transactionTime": "2024-01-01T00:00:00.000Z",
    "referenceNumber": "BOA-1234567890"
  }
}
```

### 4. Get Payment Methods

**GET** `/api/payments/boa/payment-methods`

**Response:**
```json
{
  "success": true,
  "data": {
    "methods": [
      { "id": "mobile_banking", "name": "Mobile Banking", "enabled": true },
      { "id": "internet_banking", "name": "Internet Banking", "enabled": true },
      { "id": "atm", "name": "ATM Payment", "enabled": true },
      { "id": "branch", "name": "Branch Payment", "enabled": true }
    ]
  }
}
```

### 5. Webhook Endpoint

**POST** `/api/payments/boa/webhook`

This endpoint is called by Bank of Abyssinia to notify about payment status changes.

## Payment Flow

1. **Create Payment**: User initiates payment through the API
2. **Initialize BoA**: Payment is sent to Bank of Abyssinia for processing
3. **Get Checkout URL**: User is redirected to BoA payment page
4. **Payment Processing**: User completes payment using their preferred BoA method
5. **Webhook Notification**: Bank of Abyssinia sends status update to webhook
6. **Status Update**: Payment status is updated in the database

## Payment Methods

Bank of Abyssinia supports multiple payment channels:

### 1. Mobile Banking
- Users can pay through BoA mobile banking app
- QR code scanning for quick payments
- SMS-based payment confirmations

### 2. Internet Banking
- Online banking portal payments
- Secure web-based transactions
- Real-time payment processing

### 3. ATM Payments
- ATM-based payment processing
- Card-based transactions
- 24/7 availability

### 4. Branch Payments
- In-person branch payments
- Cash and card payments
- Personalized assistance

## Error Handling

The integration includes comprehensive error handling:

- **Invalid Configuration**: Missing or invalid API credentials
- **Network Errors**: Connection issues with BoA API
- **Payment Failures**: Failed payment processing
- **Webhook Validation**: Invalid webhook signatures
- **Method Unavailable**: Unavailable payment methods

## Security

- **Signature Verification**: All webhook requests are verified using signatures
- **Environment Variables**: Sensitive data stored in environment variables
- **HTTPS Only**: All API calls use HTTPS in production
- **API Key Authentication**: Secure API key-based authentication
- **Branch Code Validation**: Branch-specific payment processing

## Testing

### Mock Mode

In development, the service returns mock responses:

```typescript
// Mock payment initialization
{
  success: true,
  data: {
    paymentUrl: `https://api.bankofabyssinia.com/pay/mock/${transactionId}`,
    transactionId: transactionId,
    qrCode: "mock_qr_code_base64",
    status: 'pending',
    referenceNumber: `BOA-${Date.now()}`
  }
}
```

### Production Testing

1. Set up proper Bank of Abyssinia credentials
2. Use test amounts (minimum 1 ETB)
3. Test all payment methods
4. Test webhook endpoints
5. Verify payment status updates

## Integration with Existing Payment System

The Bank of Abyssinia integration works alongside Chapa and Telebirr:

- **Unified API**: Same payment creation endpoint
- **Method Selection**: Choose between `chapa`, `telebirr`, and `bank_of_abyssinia`
- **Consistent Response**: Same response format for all payment methods
- **Shared Database**: Uses the same payment entities

## Monitoring

Monitor the following metrics:

- **Payment Success Rate**: Percentage of successful payments
- **Method Usage**: Most popular payment methods
- **Response Times**: API response times
- **Error Rates**: Failed payment attempts
- **Webhook Processing**: Webhook success/failure rates

## Branch Integration

Bank of Abyssinia integration supports branch-specific processing:

- **Branch Code**: Each payment can be associated with a specific branch
- **Local Processing**: Payments processed through local branch systems
- **Branch Reporting**: Branch-specific payment reports
- **Local Support**: Branch staff can assist with payment issues

## Support

For issues related to Bank of Abyssinia integration:

1. Check the logs for error messages
2. Verify environment variable configuration
3. Test with mock mode first
4. Contact Bank of Abyssinia support for API-related issues
5. Check branch-specific configurations

## Changelog

### v1.0.0
- Initial Bank of Abyssinia integration
- Payment initialization
- QR code generation
- Multiple payment methods support
- Webhook support
- Mock mode for development
- Branch code integration

## Best Practices

1. **Use Appropriate Payment Methods**: Choose the right payment method based on user preferences
2. **Handle Webhooks Properly**: Implement robust webhook handling for status updates
3. **Monitor Payment Status**: Regularly check payment status for pending transactions
4. **Error Handling**: Implement comprehensive error handling for all scenarios
5. **Security**: Always use HTTPS and validate webhook signatures
6. **Testing**: Test all payment methods before going live
7. **Documentation**: Keep integration documentation up to date
