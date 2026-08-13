import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import paymentRoutes from './routes/payment.routes';
import ticketRoutes from './routes/ticket.routes';
import shareRoutes from './routes/share.routes';
import reminderRoutes from './routes/reminder.routes';
import analyticsRoutes from './routes/analytics.routes';
import { generalLimiter } from './middlewares/rateLimiter';

const app: Application = express();

app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

app.use('/api/payments', paymentRoutes);

app.use(express.json());
app.use(generalLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/e', shareRoutes);

export default app;