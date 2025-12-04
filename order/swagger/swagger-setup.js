/**
 * Swagger Setup for Order Service
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FastFood Delivery - Order Service API',
    description: `
## Order Management API

This service handles all order-related operations including cart management and order tracking.

### Features:
- 🛒 Shopping Cart Management
- 📝 Order Creation & Management
- 📍 Real-time Order Tracking
- 🚚 Delivery Assignment
- 💳 Payment Integration

### WebSocket:
Real-time order updates are available via WebSocket:
\`\`\`
ws://localhost:5002/ws/orders/:orderId
\`\`\`

### Order Status Flow:
\`pending\` → \`confirmed\` → \`preparing\` → \`ready\` → \`picked_up\` → \`on_the_way\` → \`delivered\`
    `,
    version: '1.0.0',
    contact: {
      name: 'FastFood API Support',
      email: 'api@fastfood.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5002/api',
      description: 'Development server'
    },
    {
      url: 'https://api.fastfood.com/orders/api',
      description: 'Production server'
    }
  ],
  tags: [
    { name: 'Orders', description: 'Order management endpoints' },
    { name: 'Cart', description: 'Shopping cart endpoints' },
    { name: 'Tracking', description: 'Order tracking endpoints' }
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
  customSiteTitle: 'Order Service API Docs',
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
  console.log('📚 Swagger UI: http://localhost:5002/api-docs');
};

export default { setupSwagger, swaggerSpec };
