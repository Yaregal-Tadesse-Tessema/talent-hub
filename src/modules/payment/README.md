# Payment Module - Chapa Integration

This module provides payment processing functionality for the Ethio Talent Hub using Chapa payment gateway.

## Features

- **Chapa Payment Integration**: Full integration with Chapa payment gateway
- **Multiple Payment Types**: Support for job posting fees, premium subscriptions, application fees
- **Webhook Support**: Real-time payment status updates
- **Payment Verification**: Automatic payment verification
- **Refund Support**: Payment refund functionality
- **Multi-tenant Support**: Tenant-based payment isolation

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Chapa Configuration
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
CHAPA_BASE_URL=https://api.chapa.co/v1

# Application URLs
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourfrontend.com
```

### 2. Database Migration

The payment entities will be automatically created when you run the application with `synchronize: true`.

### 3. Chapa Account Setup

1. Create a Chapa account at [https://chapa.co](https://chapa.co)
2. Get your API keys from the dashboard
3. Configure webhook URL: `https://yourdomain.com/api/payments/webhook`

## API Endpoints

### Payment Management

- `POST /api/payments` - Create a new payment
- `GET /api/payments` - Get all payments (with pagination)
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id` - Update payment
- `POST /api/payments/:id/refund` - Refund payment

### Payment Verification

- `POST /api/payments/:transactionId/verify` - Verify payment with Chapa

### Webhooks

- `POST /api/payments/webhook` - Chapa webhook endpoint

### Chapa Integration

- `GET /api/payments/chapa/banks` - Get available banks
- `GET /api/payments/chapa/transactions` - Get Chapa transactions

## Usage Examples

### Creating a Payment

```typescript
const paymentData = {
  amount: 5000, // 50 ETB in cents
  currency: 'ETB',
  paymentMethod: 'chapa',
  paymentType: 'job_posting',
  description: 'Job posting fee',
  customerEmail: 'user@example.com',
  customerName: 'John Doe',
  referenceId: 'job_123',
  referenceType: 'job_posting'
};

const payment = await paymentService.createPayment(paymentData);
```

### Processing Webhooks

The webhook endpoint automatically processes Chapa webhooks and updates payment status.

### Verifying Payments

```typescript
const payment = await paymentService.verifyPayment(transactionId);
```

## Payment Types

- `job_posting`: Fee for posting a job
- `featured_job`: Fee for featured job posting
- `premium_subscription`: Premium user subscription
- `application_fee`: Fee for job applications
- `premium_user`: Premium user features

## Payment Statuses

- `pending`: Payment initiated but not completed
- `processing`: Payment being processed
- `completed`: Payment successfully completed
- `failed`: Payment failed
- `cancelled`: Payment cancelled
- `refunded`: Payment refunded

## Error Handling

The module includes comprehensive error handling for:
- Invalid payment amounts
- Payment not found
- Chapa API errors
- Webhook validation failures
- Refund validation

## Security

- All payment endpoints require authentication (except webhook)
- Webhook signature validation (to be implemented)
- Input validation using class-validator
- SQL injection protection through TypeORM

## Testing

Use the provided test endpoints to verify the integration:

1. Create a test payment
2. Verify payment status
3. Test webhook processing
4. Test refund functionality

## Support

For issues related to:
- Chapa integration: Check Chapa documentation
- Payment processing: Check logs and error messages
- Webhook handling: Verify webhook URL configuration
