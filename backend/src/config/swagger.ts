import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation from JSDoc comments
 */

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Royal Dansity Investments API',
      version: '1.0.0',
      description: 'RESTful API for Royal Dansity Investments International website and admin dashboard',
      contact: {
        name: 'Royal Dansity Investments',
        email: 'info@royaldansity.com.gh',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
      {
        url: 'https://api.royaldansity.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'name', 'password', 'role'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (hashed)',
            },
            role: {
              type: 'string',
              enum: ['admin', 'editor', 'viewer'],
              description: 'User role',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'User account status',
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'User avatar URL',
            },
            joinDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date user joined',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
          },
        },
        Article: {
          type: 'object',
          required: ['title', 'excerpt', 'content', 'category', 'image'],
          properties: {
            title: {
              type: 'string',
              description: 'Article title',
              example: 'Investment Strategies for 2024',
            },
            excerpt: {
              type: 'string',
              description: 'Short excerpt/summary (max 500 characters)',
              example: 'Discover the top investment strategies for maximizing returns in the current market environment.',
            },
            content: {
              type: 'string',
              description: 'Full article content (supports HTML/Markdown)',
              example: '<p>This is the full article content with detailed analysis...</p>',
            },
            category: {
              type: 'string',
              enum: ['Investment', 'Market News', 'Company Updates', 'Analysis', 'Tips'],
              description: 'Article category',
              default: 'Company Updates',
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'Featured image URL (https://... or /uploads/...)',
              example: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              description: 'Publication status (default: draft)',
              default: 'draft',
            },
            readTime: {
              type: 'string',
              description: 'Estimated read time (e.g., "5 min read")',
              example: '5 min read',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Article tags for categorization',
              example: ['investing', 'strategy', '2024'],
            },
            additionalImages: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              description: 'Additional images for the article',
            },
            videoUrl: {
              type: 'string',
              format: 'uri',
              description: 'Optional video URL (YouTube, Vimeo, etc.)',
              example: 'https://www.youtube.com/watch?v=xxxxx',
            },
          },
        },
        Message: {
          type: 'object',
          required: ['name', 'email', 'phone', 'subject', 'message'],
          properties: {
            name: {
              type: 'string',
              description: 'Sender full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Sender email',
            },
            phone: {
              type: 'string',
              description: 'Sender phone number',
            },
            subject: {
              type: 'string',
              description: 'Message subject',
            },
            message: {
              type: 'string',
              description: 'Message content',
            },
            status: {
              type: 'string',
              enum: ['unread', 'read', 'resolved'],
              description: 'Message status',
            },
            isStarred: {
              type: 'boolean',
              description: 'Is message starred',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Message priority',
            },
          },
        },
        CarouselSlide: {
          type: 'object',
          required: ['title', 'image'],
          properties: {
            _id: {
              type: 'string',
              description: 'Slide ID',
            },
            title: {
              type: 'string',
              description: 'Slide title',
            },
            subtitle: {
              type: 'string',
              description: 'Slide subtitle (optional)',
            },
            description: {
              type: 'string',
              description: 'Slide description (optional)',
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'Direct image URL (https://images.unsplash.com/... or /uploads/carousel/...)',
            },
            buttonText: {
              type: 'string',
              description: 'Call-to-action button text (optional)',
            },
            buttonLink: {
              type: 'string',
              description: 'Button link URL (optional)',
            },
            order: {
              type: 'number',
              description: 'Display order',
            },
            isActive: {
              type: 'boolean',
              description: 'Is slide active',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  error: {
                    type: 'string',
                    example: 'Validation failed',
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                        },
                        message: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Articles',
        description: 'Article/News management',
      },
      {
        name: 'Messages',
        description: 'Contact messages',
      },
      {
        name: 'Users',
        description: 'User management',
      },
      {
        name: 'Carousel',
        description: 'Homepage carousel slides',
      },
      {
        name: 'Activities',
        description: 'Activity logs',
      },
      {
        name: 'Analytics',
        description: 'Website analytics',
      },
      {
        name: 'Roles',
        description: 'Role and permission management',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

