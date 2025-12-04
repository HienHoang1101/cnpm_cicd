/**
 * Shared Swagger Configuration
 * Reusable Swagger setup for all microservices
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Create Swagger configuration for a service
 * @param {Object} options - Service-specific options
 * @returns {Object} Swagger specification
 */
export const createSwaggerSpec = (options) => {
  const {
    title,
    description,
    version = '1.0.0',
    port,
    basePath = '/api',
    tags = [],
    servers = []
  } = options;

  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title,
      description,
      version,
      contact: {
        name: 'FastFood Delivery API Support',
        email: 'support@fastfood.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: servers.length > 0 ? servers : [
      {
        url: `http://localhost:${port}${basePath}`,
        description: 'Development server'
      },
      {
        url: `http://api.fastfood.com${basePath}`,
        description: 'Production server'
      }
    ],
    tags,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error description'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 10
            },
            total: {
              type: 'integer',
              example: 100
            },
            totalPages: {
              type: 'integer',
              example: 10
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Not authorized to access this route'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Validation failed',
                errors: []
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Something went wrong!'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  };

  return swaggerDefinition;
};

/**
 * Setup Swagger UI middleware
 * @param {Express} app - Express application
 * @param {Object} swaggerSpec - Swagger specification
 * @param {string} path - URL path for Swagger UI (default: /api-docs)
 */
export const setupSwagger = (app, swaggerSpec, path = '/api-docs') => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #ff6b35 }
    `,
    customSiteTitle: `${swaggerSpec.info.title} - API Docs`,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true
    }
  };

  // Serve Swagger UI
  app.use(path, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve raw OpenAPI spec as JSON
  app.get(`${path}.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger UI available at ${path}`);
};

export default { createSwaggerSpec, setupSwagger };
