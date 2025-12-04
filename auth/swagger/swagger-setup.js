/**
 * Swagger Setup for Auth Service
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FastFood Delivery - Auth Service API',
    description: `
## Authentication & User Management API

This service handles all authentication and user management operations for the FastFood Delivery platform.

### Features:
- 🔐 User Registration & Login
- 🔑 JWT Token Management
- 👤 User Profile Management
- 📍 Address Management
- 👥 Admin User Management

### Authentication:
All protected endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Roles:
- **customer** - Regular customers who order food
- **restaurant** - Restaurant owners/managers
- **delivery** - Delivery personnel
- **admin** - System administrators
    `,
    version: '1.0.0',
    contact: {
      name: 'FastFood API Support',
      email: 'api@fastfood.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5001/api',
      description: 'Development server'
    },
    {
      url: 'https://api.fastfood.com/auth/api',
      description: 'Production server'
    }
  ],
  tags: [
    { name: 'Authentication', description: 'User authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Addresses', description: 'User address management' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' }
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
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
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
  customSiteTitle: 'Auth Service API Docs',
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
  console.log('📚 Swagger UI: http://localhost:5001/api-docs');
};

export default { setupSwagger, swaggerSpec };
