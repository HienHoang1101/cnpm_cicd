/**
 * Swagger Setup for Restaurant Service
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FastFood Delivery - Restaurant Service API',
    description: `
## Restaurant Management API

This service manages restaurants, menus, categories, and branches.

### Features:
- 🏪 Restaurant Registration & Management
- 🍽️ Menu Item Management
- 📂 Category Organization
- 🌿 Branch Management
- ⭐ Reviews & Ratings
- 📍 Location-based Search

### Public Endpoints:
- Restaurant listing and search
- Menu viewing
- Reviews

### Protected Endpoints:
- Restaurant management (owner)
- Menu management (owner)
- Branch management (owner/admin)
    `,
    version: '1.0.0',
    contact: {
      name: 'FastFood API Support',
      email: 'api@fastfood.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5003/api',
      description: 'Development server'
    },
    {
      url: 'https://api.fastfood.com/restaurants/api',
      description: 'Production server'
    }
  ],
  tags: [
    { name: 'Restaurants', description: 'Restaurant management' },
    { name: 'Menu', description: 'Menu items management' },
    { name: 'Categories', description: 'Menu categories' },
    { name: 'Branches', description: 'Restaurant branches' }
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
  customSiteTitle: 'Restaurant Service API Docs',
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
  console.log('📚 Swagger UI: http://localhost:5003/api-docs');
};

export default { setupSwagger, swaggerSpec };
