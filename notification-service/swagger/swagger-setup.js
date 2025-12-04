/**
 * Swagger Setup for Notification Service
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FastFood Delivery - Notification Service API',
    description: `
## Notification Management API

This service handles all notifications including push, email, and SMS.

### Notification Channels:
- 📱 Push Notifications (Firebase Cloud Messaging)
- 📧 Email Notifications
- 💬 SMS Notifications

### Notification Types:
- **order** - Order status updates
- **payment** - Payment confirmations
- **promotion** - Promotional messages
- **system** - System announcements
- **delivery** - Delivery updates

### Real-time:
Uses Firebase Cloud Messaging for instant push notifications.
    `,
    version: '1.0.0',
    contact: {
      name: 'FastFood API Support',
      email: 'api@fastfood.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5006/api',
      description: 'Development server'
    },
    {
      url: 'https://api.fastfood.com/notifications/api',
      description: 'Production server'
    }
  ],
  tags: [
    { name: 'Notifications', description: 'Notification management' },
    { name: 'Push', description: 'Push notification endpoints' }
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
  customSiteTitle: 'Notification Service API Docs',
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
  console.log('📚 Swagger UI: http://localhost:5006/api-docs');
};

export default { setupSwagger, swaggerSpec };
