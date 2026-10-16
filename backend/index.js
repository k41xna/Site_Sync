import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import cookieSession from 'cookie-session';
import passport from './src/config/passport.js';
import config from './src/config/app.config.js';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import organizationRoutes from './src/routes/organization.routes.js';
import orgMemberRoutes from './src/routes/org-member.routes.js';
import workerRoutes from './src/routes/worker.routes.js';
import projectRoutes from './src/routes/project.routes.js';
import applicationRoutes from './src/routes/application.routes.js';
import shiftRoutes from './src/routes/shift.routes.js';
import assignmentRoutes from './src/routes/assignment.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import payrollRoutes, { attendanceRouter } from './src/routes/payroll.routes.js';
import auditLogRoutes from './src/routes/audit-log.routes.js';
import errorHandler from './src/middlewares/errorHandler.middleware.js';
import AppError from './src/utils/appError.js';

const app = express();

// 1. Security Hardening Middleware
app.use(helmet());
app.use(mongoSanitize());

// 2. Body Parser Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. CORS Configuration
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// 4. Session Configuration
app.use(
  cookieSession({
    name: 'sitesync-session',
    keys: [config.sessionSecret],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    secure: config.env === 'production',
    httpOnly: true
  })
);

// Polyfill for Passport 0.6.0+ support with cookie-session
app.use((req, res, next) => {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb) => {
      if (cb) cb();
    };
  }
  if (req.session && !req.session.save) {
    req.session.save = (cb) => {
      if (cb) cb();
    };
  }
  next();
});

// 5. Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// 6. Connect to Database (skip if in test env to avoid duplicate connections)
if (config.env !== 'test') {
  connectDB();
}

// 7. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/members', orgMemberRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRouter);
app.use('/api/audit-logs', auditLogRoutes);

// 8. Handle Unhandled Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 9. Global Error Handler (mounted last)
app.use(errorHandler);

// 10. Start server (if not test environment)
if (config.env !== 'test') {
  app.listen(config.port, () => {
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
  });
}

export default app;
