# Your Company Name International

> A modern, full-stack web application with admin dashboard for Your Company Name International. Built with React, TypeScript, Express, MongoDB, and Socket.IO.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.9.2-blue.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Seeding the Database](#seeding-the-database)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Your Company Name International is a comprehensive web platform featuring:
- **Public Website**: Showcase services, news, and company information
- **Admin Dashboard**: Manage content, users, messages, analytics, and more
- **Real-time Updates**: Socket.IO integration for live data synchronization
- **Role-Based Access Control**: Granular permissions system for team management

---

## ✨ Features

### Public Website
- 🎨 **Modern UI/UX**: Responsive design with TailwindCSS
- 🖼️ **Dynamic Carousel**: Customizable hero carousel with admin control
- 📰 **News & Articles**: Blog-style news section with categories
- 📧 **Contact Form**: Integrated messaging system
- 🌐 **SEO Optimized**: Meta tags, sitemap, robots.txt

### Admin Dashboard
- 👥 **User Management**: Create, edit, delete users with role assignment
- 🔐 **Role & Permissions**: Custom roles with granular permission control
- 📝 **Content Management**: Articles, categories, carousel slides
- 💬 **Messages**: Inbox-style message management with replies
- 📊 **Analytics**: Traffic, page performance, user activity tracking
- 🔔 **Notifications**: Real-time notification system
- 🎨 **Customization**: Theme colors, company logo upload
- 📤 **Export Reports**: CSV export for analytics, users, articles

### Security & Authentication
- 🔒 **JWT Authentication**: Secure token-based auth with refresh tokens
- 🛡️ **Rate Limiting**: Protect against brute force attacks
- 🔑 **Password Reset**: Email-based password recovery
- 👮 **RBAC**: Role-based access control with custom permissions
- 🔐 **Password Strength**: Client-side validation with strength indicator

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: React Router 6 (SPA mode)
- **Styling**: TailwindCSS 3 + Radix UI
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form + Zod validation
- **Notifications**: React Hot Toast + SweetAlert2
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **File Upload**: Multer
- **Email**: Nodemailer
- **Real-time**: Socket.IO
- **Logging**: Winston
- **API Docs**: Swagger/OpenAPI

### DevOps & Tools
- **Package Manager**: pnpm
- **Version Control**: Git
- **API Testing**: Swagger UI
- **Linting**: ESLint
- **Type Checking**: TypeScript

---

## 📁 Project Structure

```
Royal Dansity/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Database, Swagger config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── scripts/           # Database seeding
│   │   ├── utils/             # Helper functions
│   │   ├── validators/        # Zod schemas
│   │   └── index.ts           # Server entry point
│   ├── uploads/               # User-uploaded files
│   ├── logs/                  # Application logs
│   └── package.json
│
├── client/                   # React frontend
│   ├── website/              # Public website pages
│   │   ├── pages/            # Home, About, Services, etc.
│   │   └── components/       # Header, Footer, etc.
│   ├── dashboard/            # Admin dashboard
│   │   ├── pages/            # Admin pages
│   │   └── components/       # Dashboard components
│   ├── shared/               # Shared components (UI library)
│   │   └── components/       # Buttons, inputs, modals, etc.
│   ├── contexts/             # React contexts (Auth, etc.)
│   ├── lib/                  # API client, utilities
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
│
├── shared/                   # Shared types (client + server)
│   └── api.ts
│
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── package.json              # Root package.json
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (or npm/yarn)
- **MongoDB**: v6.0 or higher (local or Atlas)
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/royal-dansity.git
   cd royal-dansity
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy example env files
   cp backend/env.example backend/.env
   
   # Edit .env files with your configuration
   # See "Environment Variables" section below
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in backend/.env
   ```

5. **Seed the database**
   ```bash
   cd backend
   npm run seed
   cd ..
   ```

6. **Start the application**
   ```bash
   # Terminal 1: Start backend (port 5001)
   cd backend
   npm run dev

   # Terminal 2: Start frontend (port 5173)
   cd ..
   npm run dev
   ```

7. **Access the application**
   - **Website**: http://localhost:5173
   - **Admin Dashboard**: http://localhost:5173/admin/login
   - **API Docs**: http://localhost:5001/api-docs

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/royal-dansity

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Nodemailer)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=noreply@royaldansity.com

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
```


```env
VITE_API_URL=http://localhost:5001
```

**📝 Note**: See `backend/env.example` for a complete list with descriptions.

---

## 🏃 Running the Application

### Development Mode

```bash
# Start backend (with hot reload)
cd backend
npm run dev

# Start frontend (with hot reload)
cd ..
npm run dev
```

### Production Build

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd ..
npm run build
npm preview
```

### Testing

```bash
# Run tests (if configured)
npm test

# Type checking
cd backend
pnpm run typecheck
```

---

## 🌱 Seeding the Database

The seed script populates the database with:
- **Permissions**: All available system permissions
- **Roles**: Admin, Editor, Viewer (with assigned permissions)
- **Default Admin User**: 
  - Email: `admin@royaldansity.com`
  - Password: `Admin@123!`
  - ⚠️ **Change this password immediately after first login!**

```bash
cd backend
npm run seed
```

**Individual Seed Scripts**:
```bash
npm run seed:permissions  # Seed permissions only
npm run seed:roles        # Seed roles only
```

---

## 📚 API Documentation

### Swagger UI

Access interactive API documentation at: **http://localhost:5001/api-docs**

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

#### Articles
- `GET /api/articles` - Get all articles (with pagination)
- `GET /api/articles/:slug` - Get article by slug
- `POST /api/articles` - Create article (requires permission)
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

#### Roles & Permissions
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create custom role (admin only)
- `GET /api/roles/permissions` - Get all permissions

For complete API reference, see Swagger documentation.

---

## 🚀 Deployment

### Backend Deployment (Heroku, Railway, Render)

1. **Set environment variables** on your hosting platform
2. **Deploy backend**:
   ```bash
   cd backend
   npm run build
   # Deploy dist/ folder
   ```

### Frontend Deployment (Netlify, Vercel)

1. **Build frontend**:
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder** to your hosting platform

3. **Configure redirects** for SPA routing:
   ```toml
   # netlify.toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Database (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

---

## 🎯 Default Admin Credentials

After seeding the database:

- **Email**: `admin@royaldansity.com`
- **Password**: `Admin@123`

⚠️ **Important**: Change these credentials immediately after first login!

⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## 📖 Additional Documentation

For more detailed technical documentation, see:
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Architecture, database schema, advanced features
- **[backend/src/README.md](./backend/src/README.md)** - Backend-specific documentation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is unlicensed. Using this software without express permision violates copyright law.

---

## 👏 Credits

**Created with ❤️ by [Taurean IT Logistics](https://taureanitlogistics.com/)**

---

## 📞 Support

For support, email info@royaldansityinvestmnts.com.gh or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Multi-language support (i18n)
- [ ] Dark mode for entire application
- [ ] Advanced analytics with charts
- [ ] Scheduled tasks (cron jobs)
- [ ] CI/CD pipeline
- [ ] Unit and integration tests
- [ ] Mobile app (React Native)

---

**Made with 💛 for Your Company Name International**


