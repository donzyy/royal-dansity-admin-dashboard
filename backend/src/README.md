# Royal Dansity Backend API

A production-ready RESTful API built with Express, TypeScript, MongoDB, and JWT authentication.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Editor, Viewer)
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schema validation for all endpoints
- **API Documentation**: Swagger/OpenAPI auto-generated documentation
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Winston logger with file and console transports
- **Rate Limiting**: Protection against API abuse
- **Security**: CORS, bcrypt password hashing, JWT tokens

## 📁 Project Structure

```
server/
├── config/           # Configuration files
│   ├── database.ts   # MongoDB connection
│   └── swagger.ts    # Swagger/OpenAPI config
├── controllers/      # Request handlers
│   ├── auth.controller.ts
│   ├── article.controller.ts
│   ├── message.controller.ts
│   ├── user.controller.ts
│   ├── carousel.controller.ts
│   ├── activity.controller.ts
│   └── analytics.controller.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication & authorization
│   ├── errorHandler.ts
│   ├── validator.ts
│   └── rateLimit.ts
├── models/          # Mongoose models
│   ├── User.ts
│   ├── Article.ts
│   ├── Message.ts
│   ├── CarouselSlide.ts
│   ├── Activity.ts
│   └── Analytics.ts
├── routes/          # API routes
│   ├── auth.routes.ts
│   ├── article.routes.ts
│   ├── message.routes.ts
│   ├── user.routes.ts
│   ├── carousel.routes.ts
│   ├── activity.routes.ts
│   └── analytics.routes.ts
├── utils/           # Utility functions
│   ├── jwt.ts       # JWT token helpers
│   └── logger.ts    # Winston logger
├── validators/      # Zod validation schemas
│   ├── auth.validator.ts
│   ├── article.validator.ts
│   ├── message.validator.ts
│   ├── user.validator.ts
│   └── carousel.validator.ts
└── index.ts         # Server entry point
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=8080

# Database
MONGODB_URI=mongodb://localhost:27017/royal-dansity

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:8080
```

### 3. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

For local MongoDB:
```bash
mongod
```

For MongoDB Atlas, update `MONGODB_URI` in `.env` with your connection string.

### 4. Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:8080`

## 📚 API Documentation

Once the server is running, visit:

```
http://localhost:8080/api-docs
```

This will open the interactive Swagger UI where you can test all API endpoints.

## 🔐 Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@royaldansity.com",
  "password": "your-password"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Using Protected Routes

Include the JWT token in the Authorization header:

```http
GET /api/users
Authorization: Bearer your-jwt-token
```

## 🛣️ API Routes

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user
- `PUT /password` - Update password
- `POST /logout` - Logout user

### Articles (`/api/articles`)
- `GET /` - Get all articles (public)
- `GET /:id` - Get article by ID
- `GET /slug/:slug` - Get article by slug
- `POST /` - Create article (Admin/Editor)
- `PUT /:id` - Update article (Admin/Editor)
- `DELETE /:id` - Delete article (Admin)

### Messages (`/api/messages`)
- `POST /` - Submit contact form (public)
- `GET /` - Get all messages (Admin/Editor)
- `GET /:id` - Get message by ID (Admin/Editor)
- `PUT /:id` - Update message (Admin/Editor)
- `DELETE /:id` - Delete message (Admin)

### Users (`/api/users`)
- `GET /` - Get all users (Admin)
- `GET /:id` - Get user by ID (Admin)
- `POST /` - Create user (Admin)
- `PUT /:id` - Update user (Admin)
- `DELETE /:id` - Delete user (Admin)

### Carousel (`/api/carousel`)
- `GET /` - Get all slides (public)
- `GET /:id` - Get slide by ID (Admin/Editor)
- `POST /` - Create slide (Admin/Editor)
- `PUT /:id` - Update slide (Admin/Editor)
- `DELETE /:id` - Delete slide (Admin)

### Activities (`/api/activities`)
- `GET /` - Get all activities (Admin)
- `GET /user/:userId` - Get user activities (Admin)

### Analytics (`/api/analytics`)
- `GET /dashboard` - Get dashboard stats (Admin/Editor)
- `GET /` - Get analytics data (Admin/Editor)
- `POST /record` - Record analytics (public)

## 🔒 User Roles

- **Admin**: Full access to all resources
- **Editor**: Can manage articles, carousel, and view messages
- **Viewer**: Read-only access to published content

## 📊 Database Models

### User
- Email, name, password (hashed)
- Role (admin/editor/viewer)
- Status (active/inactive)
- Avatar, join date, last login

### Article
- Title, excerpt, content
- Category, image, tags
- Author, status (draft/published)
- Slug, views, published date

### Message
- Name, email, phone
- Subject, message
- Status (unread/read/resolved)
- Priority, starred, notes

### CarouselSlide
- Title, subtitle, image
- Button text/link
- Order, active status

### Activity
- Type, actor, description
- Metadata, IP address, user agent
- Timestamp

### Analytics
- Date, visitors, page views
- Bounce rate, top pages
- Device types, referral sources

## 🧪 Testing

The API can be tested using:
- Swagger UI (`/api-docs`)
- Postman
- cURL
- Any HTTP client

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### JWT Token Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration
- Verify Authorization header format

### Validation Errors
- Check request body against Zod schemas in `/validators`
- Ensure all required fields are provided
- Verify data types and formats

## 📝 Best Practices

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong JWT secrets** - Generate random strings for production
3. **Implement rate limiting** - Already configured for auth and contact routes
4. **Log errors properly** - Winston logger is configured
5. **Validate all inputs** - Zod schemas handle this
6. **Use HTTPS in production** - Configure reverse proxy (nginx/Apache)

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or production database
- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure proper `CORS_ORIGIN`
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

## 📞 Support

For issues or questions, contact the development team.

