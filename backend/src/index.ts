import "dotenv/config";
import express from "express";
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/database";
import { swaggerSpec } from "./config/swagger";
import { logger } from "./utils/logger";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimit";

// Import routes
import authRoutes from "./routes/auth.routes";
import articleRoutes from "./routes/article.routes";
import messageRoutes from "./routes/message.routes";
import userRoutes from "./routes/user.routes";
import carouselRoutes from "./routes/carousel.routes";
import activityRoutes from "./routes/activity.routes";
import analyticsRoutes from "./routes/analytics.routes";
import uploadRoutes from "./routes/upload.routes";
import categoryRoutes from "./routes/category.routes";
import notificationRoutes from "./routes/notification.routes";
import roleRoutes from "./routes/role.routes";

/**
 * Initialize Express Application
 */
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;

/**
 * Initialize Socket.IO
 */
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

/**
 * Connect to MongoDB
 */
connectDB();

/**
 * Middleware Configuration
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Logging Middleware
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

/**
 * API Documentation - Swagger UI
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Royal Dansity API Documentation',
  explorer: true,
}));

/**
 * Health Check Endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Royal Dansity API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Serve Static Files (Uploads & Public)
 */
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/articles', apiLimiter, articleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/carousel', apiLimiter, carouselRoutes);
app.use('/api/activities', apiLimiter, activityRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/roles', apiLimiter, roleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);

/**
 * 404 Handler
 */
app.use(notFound);

/**
 * Error Handler (must be last)
 */
app.use(errorHandler);

/**
 * Start Server
 */
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Royal Dansity Backend Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket: Enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  logger.info(`Server started on port ${PORT} with WebSocket support`);
});
