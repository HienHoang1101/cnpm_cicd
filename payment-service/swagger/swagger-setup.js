/**
 * Swagger Setup for Payment Service
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FastFood Delivery - Payment Service API',
    description: `
## Payment Processing API

This service handles all payment operations including multiple payment gateways.

### Supported Payment Methods:
- 💵 Cash on Delivery
- 💳 Credit/Debit Card (Stripe)
- 📱 MoMo Wallet
- 📱 ZaloPay
- 🏦 VNPay

### Payment Flow:
1. Create payment with order ID
2. For online payments, redirect to payment gateway
3. Gateway sends webhook on completion
4. Payment status updated

### Webhooks:
Payment gateways send status updates to:
\`POST /api/payment/webhook\`

All webhooks are verified using HMAC signatures.
    `,
    version: '1.0.0',
    contact: {
      name: 'FastFood API Support',
      email: 'api@fastfood.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5005/api',
      description: 'Development server'
    },
    {
      url: 'https://api.fastfood.com/payments/api',
      description: 'Production server'
    }
  ],
  tags: [
    { name: 'Payments', description: 'Payment processing endpoints' },
    { name: 'Refunds', description: 'Refund management' },
    { name: 'Webhooks', description: 'Payment gateway webhooks' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 10 }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid'
      },
      NotFoundError: {
        description: 'Resource not found'
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./swagger/*.js', './routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Payment Service API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  console.log('📚 Swagger UI: http://localhost:5005/api-docs');
};

export default { setupSwagger, swaggerSpec };
