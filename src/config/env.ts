import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: process.env.PORT || '5000',
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: required('MONGO_URI'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  redisUrl: required('REDIS_URL'),
  paystackSecretKey: required('PAYSTACK_SECRET_KEY'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  smtpHost: required('SMTP_HOST'),
  smtpPort: process.env.SMTP_PORT || '587',
  smtpUser: required('SMTP_USER'),
  smtpPass: required('SMTP_PASS'),
};