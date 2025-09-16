# Telebirr Payment Integration

This document describes the Telebirr payment integration for the Talent Hub payment module.

## Overview

TeleBirr is Ethiopia's leading mobile money service that allows users to make payments, transfer money, and pay for services using their mobile phones. This integration provides seamless payment processing for the Talent Hub platform.

## Features

- **Payment Initialization**: Create payment requests with Telebirr
- **QR Code Generation**: Generate QR codes for easy mobile payments
- **Payment Status Query**: Check payment status in real-time
- **Webhook Support**: Handle payment notifications automatically
- **Mock Mode**: Development-friendly mock responses

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Telebirr Configuration
TELEBIRR_BASE_URL=https://api.ethiotelebirr.com
TELEBIRR_APP_ID=your_app_id
TELEBIRR_APP_KEY=your_app_key
TELEBIRR_PUBLIC_KEY=your_public_key
TELEBIRR_PRIVATE_KEY=your_private_key
TELEBIRR_NOTIFY_URL=https://your-domain.com/api/payments/telebirr/webhook
TELEBIRR_RETURN_URL=https://your-domain.com/payment/success
```

### Development Mode

For development, the service will use mock values if the environment variables are not set:
- `TELEBIRR_APP_ID` defaults to `test_app_id`
- `TELEBIRR_APP_KEY` defaults to `test_app_key`
- `TELEBIRR_PUBLIC_KEY` defaults to `test_public_key`
- `TELEBIRR_PRIVATE_KEY` defaults to `test_private_key`

## API Endpoints

### 1. Create Payment with Telebirr

**POST** `/api/payments`

```json
{
  "amount": 5000,
  "currency": "ETB",
  "paymentMethod": "telebirr",
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
  "transactionId": "telebirr-1234567890-abc123",
  "amount": 5000,
  "currency": "ETB",
  "status": "processing",
  "checkoutUrl": "https://api.ethiotelebirr.com/pay/mock/telebirr-1234567890-abc123",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Generate QR Code

**POST** `/api/payments/telebirr/qr-code`

```json
{
  "totalAmount": 5000,
  "subject": "Job posting fee",
  "outTradeNo": "telebirr-1234567890-abc123",
  "shortCode": "1001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "outTradeNo": "telebirr-1234567890-abc123"
  }
}
```

### 3. Query Payment Status

**GET** `/api/payments/telebirr/query/:outTradeNo`

**Response:**
```json
{
  "success": true,
  "data": {
    "outTradeNo": "telebirr-1234567890-abc123",
    "tradeStatus": "SUCCESS",
    "totalAmount": 5000,
    "currency": "ETB",
    "tradeTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Webhook Endpoint

**POST** `/api/payments/telebirr/webhook`

This endpoint is called by Telebirr to notify about payment status changes.

## Payment Flow

1. **Create Payment**: User initiates payment through the API
2. **Initialize Telebirr**: Payment is sent to Telebirr for processing
3. **Get Checkout URL**: User is redirected to Telebirr payment page
4. **Payment Processing**: User completes payment on Telebirr
5. **Webhook Notification**: Telebirr sends status update to webhook
6. **Status Update**: Payment status is updated in the database

## Error Handling

The integration includes comprehensive error handling:

- **Invalid Configuration**: Missing or invalid API credentials
- **Network Errors**: Connection issues with Telebirr API
- **Payment Failures**: Failed payment processing
- **Webhook Validation**: Invalid webhook signatures

## Security

- **Signature Verification**: All webhook requests are verified using signatures
- **Environment Variables**: Sensitive data stored in environment variables
- **HTTPS Only**: All API calls use HTTPS in production

## Testing

### Mock Mode

In development, the service returns mock responses:

```typescript
// Mock payment initialization
{
  success: true,
  data: {
    toPayUrl: `https://api.ethiotelebirr.com/pay/mock/${outTradeNo}`,
    outTradeNo: outTradeNo,
    qrCode: "mock_qr_code_base64",
    status: 'pending'
  }
}
```

### Production Testing

1. Set up proper Telebirr credentials
2. Use test amounts (minimum 1 ETB)
3. Test webhook endpoints
4. Verify payment status updates

## Integration with Existing Payment System

The Telebirr integration works alongside the existing Chapa integration:

- **Unified API**: Same payment creation endpoint
- **Method Selection**: Choose between `chapa` and `telebirr`
- **Consistent Response**: Same response format for all payment methods
- **Shared Database**: Uses the same payment entities

## Monitoring

Monitor the following metrics:

- **Payment Success Rate**: Percentage of successful payments
- **Response Times**: API response times
- **Error Rates**: Failed payment attempts
- **Webhook Processing**: Webhook success/failure rates

## Support

For issues related to Telebirr integration:

1. Check the logs for error messages
2. Verify environment variable configuration
3. Test with mock mode first
4. Contact Telebirr support for API-related issues

## Changelog

### v1.0.0
- Initial Telebirr integration
- Payment initialization
- QR code generation
- Webhook support
- Mock mode for development
