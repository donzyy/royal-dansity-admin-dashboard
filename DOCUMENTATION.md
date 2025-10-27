# Technical Documentation

> Comprehensive technical documentation for Royal Dansity Investments International platform

---

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints](#api-endpoints)
5. [Real-time Features](#real-time-features)
6. [File Upload System](#file-upload-system)
7. [Email System](#email-system)
8. [Analytics System](#analytics-system)
9. [Role & Permission System](#role--permission-system)
10. [Frontend Architecture](#frontend-architecture)
11. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│  Express Backend │◄───────►│    MongoDB      │
│  (Port 5173)    │         │  (Port 5001)     │         │                 │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │                            │
        │                    ┌───────▼────────┐
        │                    │                │
        └───────────────────►│   Socket.IO    │
                             │  (Real-time)   │
                             │                │
                             └────────────────┘
```

### Technology Stack

#### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **React Router 6**: Client-side routing
- **TailwindCSS 3**: Utility-first CSS
- **Radix UI**: Accessible component primitives
- **Axios**: HTTP client
- **Socket.IO Client**: Real-time communication
- **Vite**: Build tool

#### Backend
- **Node.js + Express**: Server framework
- **TypeScript**: Type safety
- **MongoDB + Mongoose**: Database
- **JWT**: Authentication
- **Socket.IO**: Real-time communication
- **Multer**: File uploads
- **Nodemailer**: Email sending
- **Winston**: Logging
- **Swagger**: API documentation

---

## Database Schema

### User Model

```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique, lowercase),
  password: string (hashed with bcrypt),
  role: string (references Role.slug),
  status: 'active' | 'inactive',
  avatar?: string,
  lastLogin?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `email` (unique)

### Role Model

```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique, auto-generated),
  description?: string,
  permissions: string[] (array of permission slugs),
  isSystem: boolean (true for admin/editor/viewer),
  createdAt: Date,
  updatedAt: Date
}
```

**System Roles**:
- `admin`: Full system access
- `editor`: Content management
- `viewer`: Read-only access

### Permission Model

```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  category: string,
  description?: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Categories**: Dashboard, Analytics, Users, Roles, Articles, Categories, Carousel, Messages, Activity, Settings

### Article Model

```typescript
{
  _id: ObjectId,
  title: string,
  slug: string (unique, auto-generated),
  content: string,
  excerpt: string,
  featuredImage: string,
  author: ObjectId (references User),
  category: ObjectId (references Category),
  status: 'draft' | 'published',
  views: number (default: 0),
  publishedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `slug` (unique), `author`, `category`, `status`

### Category Model

```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique, auto-generated),
  description?: string,
  color?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### CarouselSlide Model

```typescript
{
  _id: ObjectId,
  title: string,
  subtitle?: string,
  image: string,
  buttonText?: string,
  buttonLink?: string,
  order: number,
  isActive: boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `order`

### Message Model

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  subject: string,
  message: string,
  status: 'unread' | 'read' | 'resolved',
  starred: boolean (default: false),
  replies: [{
    content: string,
    author: ObjectId (references User),
    createdAt: Date
  }],
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `email`, `status`, `starred`

### Activity Model

```typescript
{
  _id: ObjectId,
  type: string,
  description: string,
  actorEmail: string,
  actorName: string,
  targetId?: string,
  targetType?: string,
  details?: any,
  createdAt: Date
}
```

**Indexes**: `actorEmail`, `type`, `createdAt`

### Analytics Model

```typescript
{
  _id: ObjectId,
  date: Date,
  pageViews: number,
  uniqueVisitors: number,
  articleViews: number,
  messageCount: number,
  userRegistrations: number,
  createdAt: Date
}
```

**Indexes**: `date` (unique)

### Notification Model

```typescript
{
  _id: ObjectId,
  userId: ObjectId (references User),
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  read: boolean (default: false),
  link?: string,
  createdAt: Date
}
```

**Indexes**: `userId`, `read`, `createdAt`

---

## Authentication & Authorization

### JWT Authentication Flow

```
1. User logs in with email + password
2. Backend validates credentials
3. Backend generates:
   - Access Token (15 min expiry)
   - Refresh Token (7 days expiry)
4. Frontend stores tokens in localStorage
5. Frontend includes Access Token in Authorization header
6. When Access Token expires, use Refresh Token to get new Access Token
```

### Token Structure

**Access Token Payload**:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Password Security

- **Hashing**: bcrypt with 10 salt rounds
- **Strength Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

### Password Reset Flow

```
1. User requests password reset (email)
2. Backend generates reset token (JWT, 1 hour expiry)
3. Backend sends email with reset link
4. User clicks link, enters new password
5. Backend validates token and updates password
6. User can log in with new password
```

### Role-Based Access Control (RBAC)

#### Middleware: `authorize(...roles)`

Checks if user's role is in allowed roles list OR has wildcard permissions.

```typescript
// Example: Only admins can access
router.get('/admin-only', authenticate, authorize('admin'), handler);

// Example: Admins or editors
router.get('/content', authenticate, authorize('admin', 'editor'), handler);
```

#### Middleware: `checkPermission(...permissions)`

Checks if user's role has specific permissions.

```typescript
// Example: Requires 'create_articles' permission
router.post('/articles', 
  authenticate, 
  checkPermission('create_articles'), 
  handler
);
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | Yes (Refresh Token) |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/update-profile` | Update profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

### User Management Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/api/users` | Get all users | `view_users` |
| GET | `/api/users/:id` | Get user by ID | `view_users` |
| POST | `/api/users` | Create user | `create_users` |
| PUT | `/api/users/:id` | Update user | `edit_users` |
| DELETE | `/api/users/:id` | Delete user | `delete_users` |
| POST | `/api/users/me/avatar` | Upload avatar | None (own profile) |
| GET | `/api/users/export` | Export users CSV | `export_reports` |

### Article Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/api/articles` | Get all articles | None (public) |
| GET | `/api/articles/:slug` | Get article by slug | None (public) |
| POST | `/api/articles` | Create article | `create_articles` |
| PUT | `/api/articles/:id` | Update article | `edit_articles` |
| DELETE | `/api/articles/:id` | Delete article | `delete_articles` |
| GET | `/api/articles/export` | Export articles CSV | `export_reports` |

### Category Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/api/categories` | Get all categories | None (public) |
| GET | `/api/categories/:id` | Get category by ID | None (public) |
| POST | `/api/categories` | Create category | `manage_categories` |
| PUT | `/api/categories/:id` | Update category | `manage_categories` |
| DELETE | `/api/categories/:id` | Delete category | `manage_categories` |

### Carousel Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/api/carousel` | Get all slides | None (public) |
| GET | `/api/carousel/:id` | Get slide by ID | `view_carousel` |
| POST | `/api/carousel` | Create slide | `manage_carousel` |
| PUT | `/api/carousel/:id` | Update slide | `manage_carousel` |
| PUT | `/api/carousel/:id/reorder` | Reorder slide | `manage_carousel` |
| DELETE | `/api/carousel/:id` | Delete slide | `manage_carousel` |

### Message Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/api/messages` | Get all messages | `view_messages` |
| GET | `/api/messages/:id` | Get message by ID | `view_messages` |
| POST | `/api/messages` | Create message | None (public) |
| PUT | `/api/messages/:id` | Update message | `view_messages` |
| POST | `/api/messages/:id/reply` | Reply to message | `reply_messages` |
| DELETE | `/api/messages/:id` | Delete message | `delete_messages` |
| GET | `/api/messages/export` | Export messages CSV | `export_reports` |

### Role & Permission Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/api/roles` | Get all roles | `view_roles` |
| GET | `/api/roles/:id` | Get role by ID | `view_roles` |
| POST | `/api/roles` | Create role | `manage_roles` |
| PUT | `/api/roles/:id` | Update role | `manage_roles` |
| DELETE | `/api/roles/:id` | Delete role | `manage_roles` |
| GET | `/api/roles/permissions` | Get all permissions | `view_roles` |

### Analytics Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/api/analytics/overview` | Get dashboard overview | `view_analytics` |
| GET | `/api/analytics/traffic` | Get traffic data | `view_analytics` |
| GET | `/api/analytics/export` | Export analytics CSV | `export_reports` |

### Activity Log Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/api/activities` | Get all activities | `view_activity_log` |
| GET | `/api/activities/:id` | Get activity by ID | `view_activity_log` |

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

---

## Real-time Features

### Socket.IO Events

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `carousel:created` | `{ slide }` | New carousel slide created |
| `carousel:updated` | `{ slide }` | Carousel slide updated |
| `carousel:deleted` | `{ id }` | Carousel slide deleted |
| `article:created` | `{ article }` | New article published |
| `article:updated` | `{ article }` | Article updated |
| `article:deleted` | `{ id }` | Article deleted |
| `message:new` | `{ message }` | New message received |
| `message:updated` | `{ message }` | Message status changed |
| `notification:new` | `{ notification }` | New notification |

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connect` | - | Client connected |
| `disconnect` | - | Client disconnected |

### Usage Example

**Frontend**:
```typescript
import io from 'socket.io-client';

// Use environment variable for WebSocket URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;
const socket = io(SOCKET_URL);

socket.on('article:created', (data) => {
  console.log('New article:', data.article);
  // Update UI
});
```

**Backend**:
```typescript
io.emit('article:created', { article });
```

---

## File Upload System

### Configuration

- **Storage**: Local filesystem (`backend/uploads/`)
- **Max File Size**: 5MB (configurable)
- **Allowed Types**: Images (jpg, jpeg, png, gif, webp)

### Folder Structure

```
backend/uploads/
├── articles/       # Article featured images
├── carousel/       # Carousel slide images
├── users/          # User avatars
└── misc/           # Other uploads
```

### Upload Endpoints

| Endpoint | Destination | Description |
|----------|-------------|-------------|
| `/api/upload/article` | `uploads/articles/` | Article images |
| `/api/upload/carousel` | `uploads/carousel/` | Carousel images |
| `/api/users/me/avatar` | `uploads/users/` | User avatars |

### Image URL Format

**Stored in DB**: `/uploads/articles/image-123.jpg`  
**Accessed via**: `http://localhost:5001/uploads/articles/image-123.jpg`

### Frontend Helper

```typescript
const getFullImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};
```

---

## Email System

### Configuration (Nodemailer)

**Development**: Use Mailtrap.io for testing  
**Production**: Use SendGrid, AWS SES, or SMTP provider

### Email Templates

#### Password Reset Email

```
Subject: Reset Your Password

Hi [Name],

You requested to reset your password. Click the link below:

[Reset Password Link]

This link expires in 1 hour.

If you didn't request this, ignore this email.

Best regards,
Royal Dansity Team
```

#### Welcome Email (Optional)

```
Subject: Welcome to Royal Dansity

Hi [Name],

Welcome to Royal Dansity Investments International!

Your account has been created successfully.

Best regards,
Royal Dansity Team
```

### Sending Emails

```typescript
import { sendEmail } from './utils/email';

await sendEmail({
  to: user.email,
  subject: 'Reset Your Password',
  text: 'Click here to reset...',
  html: '<p>Click here to reset...</p>'
});
```

---

## Analytics System

### How Analytics Are Calculated

#### Page Views
- Incremented on every page load
- Tracked per day in Analytics model
- Displayed in dashboard charts

#### Unique Visitors
- Tracked by IP address (simplified)
- Production: Use cookies or session IDs

#### Article Views
- Incremented when article detail page is viewed
- Stored in Article model (`views` field)
- Aggregated for analytics

#### Message Count
- Count of messages received per day
- Grouped by status (unread, read, resolved)

#### User Registrations
- Count of new users per day
- Displayed in growth charts

### Analytics Endpoints

```typescript
GET /api/analytics/overview
Response: {
  totalUsers: number,
  totalArticles: number,
  totalMessages: number,
  totalViews: number,
  recentActivity: Activity[]
}
```

---

## Role & Permission System

### Permission Categories

1. **Dashboard**: `view_dashboard`
2. **Analytics**: `view_analytics`, `export_reports`
3. **Users**: `view_users`, `create_users`, `edit_users`, `delete_users`
4. **Roles**: `view_roles`, `manage_roles`
5. **Articles**: `view_articles`, `create_articles`, `edit_articles`, `delete_articles`, `publish_articles`
6. **Categories**: `view_categories`, `manage_categories`
7. **Carousel**: `view_carousel`, `manage_carousel`
8. **Messages**: `view_messages`, `reply_messages`, `delete_messages`
9. **Activity**: `view_activity_log`
10. **Settings**: `manage_settings`

### Creating Custom Roles

1. Navigate to **Admin Dashboard → Roles**
2. Click **"Create New Role"**
3. Enter role name and description
4. Select permissions (checkboxes)
5. Save

### Assigning Roles to Users

1. Navigate to **Admin Dashboard → Users**
2. Click **"Edit"** on a user
3. Select role from dropdown
4. Save

---

## Frontend Architecture

### Routing Structure

```
/                           → Website Home
/about                      → About Us
/services                   → Services
/news                       → News & Articles
/news/:slug                 → Article Detail
/contact                    → Contact Form

/admin/login                → Admin Login
/admin/dashboard            → Dashboard Overview
/admin/users                → User Management
/admin/roles                → Role Management
/admin/news                 → Article Management
/admin/categories           → Category Management
/admin/carousel             → Carousel Management
/admin/messages             → Message Inbox
/admin/analytics            → Analytics Dashboard
/admin/settings             → Account Settings
```

### State Management

- **Auth Context**: Global authentication state
- **Local State**: Component-level state with `useState`
- **No Redux**: Kept simple with Context API

### API Client

```typescript
// client/lib/api.ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address

#### 2. JWT Token Expired

**Error**: `401 Unauthorized - Token expired`

**Solution**:
- Frontend should use refresh token to get new access token
- If refresh token expired, user must log in again

#### 3. File Upload Fails

**Error**: `413 Payload Too Large`

**Solution**:
- Check `MAX_FILE_SIZE` in backend `.env`
- Ensure file is under 5MB
- Increase limit if needed

#### 4. CORS Errors

**Error**: `Access-Control-Allow-Origin` error

**Solution**:
- Ensure `FRONTEND_URL` is set in backend `.env`
- Check CORS configuration in `backend/src/index.ts`

#### 5. Socket.IO Not Connecting

**Error**: `WebSocket connection failed`

**Solution**:
- Ensure backend is running on correct port
- Check Socket.IO URL in frontend
- Verify firewall/proxy settings

### Logging

**Backend Logs**: `backend/logs/`
- `all.log`: All logs
- `error.log`: Error logs only

**View Logs**:
```bash
cd backend
tail -f logs/all.log
```

---

## Performance Optimization

### Backend
- **Database Indexing**: Added indexes on frequently queried fields
- **Pagination**: Implemented for all list endpoints
- **Caching**: Consider Redis for production
- **Rate Limiting**: Protects against abuse

### Frontend
- **Code Splitting**: Lazy load routes
- **Image Optimization**: Compress images before upload
- **Memoization**: Use `useMemo` and `useCallback`
- **Virtual Scrolling**: For large lists

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** in production
4. **Sanitize user inputs** (Zod validation)
5. **Rate limit** authentication endpoints
6. **Hash passwords** with bcrypt (never store plain text)
7. **Validate file uploads** (type, size)
8. **Use CORS** to restrict API access
9. **Keep dependencies updated** (`pnpm update`)
10. **Monitor logs** for suspicious activity

---

## Testing Strategy

### Unit Tests
- Test individual functions and utilities
- Use Jest + React Testing Library

### Integration Tests
- Test API endpoints
- Use Supertest

### E2E Tests
- Test user flows
- Use Cypress or Playwright

---

## Future Enhancements

- [ ] **Cron Jobs**: Scheduled tasks (cleanup, reports)
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Multi-language Support**: i18n for website
- [ ] **Dark Mode**: Full app dark theme
- [ ] **Advanced Analytics**: Charts, graphs, trends
- [ ] **Email Templates**: Rich HTML email templates
- [ ] **Two-Factor Authentication**: Enhanced security
- [ ] **Audit Logs**: Detailed user action tracking
- [ ] **API Rate Limiting**: Per-user limits
- [ ] **Webhooks**: External integrations

---

**For questions or support, contact: info@royaldansity.com**


