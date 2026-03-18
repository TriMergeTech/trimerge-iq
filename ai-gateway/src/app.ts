import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { globalLimiter } from './middlewares/rateLimiter';
import logger from './utils/logger';
import routes from './routes';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

// Apply global rate limiting
app.use(globalLimiter);

// API Routes
app.use('/api', routes);

// Basic Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'AI Gateway is up and running!' });
});

export default app;