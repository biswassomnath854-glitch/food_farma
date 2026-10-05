import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes';
import { env } from './config/env';
import { sendError, sendSuccess } from './utils/response';

const app = express();

// Security Middlewares with CORS dynamic origin support
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any localhost origin during development or requests with no origin (e.g. mobile/postman)
      if (!origin || origin.startsWith('http://localhost') || origin === env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  return sendSuccess(res, 'Eat N Bite Backend API is operational', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api', routes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  return sendError(res, `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`, 404);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Server Error:', err);
  return sendError(res, err.message || 'Internal Server Error', err.status || 500);
});

export default app;
