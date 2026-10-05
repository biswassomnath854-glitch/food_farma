import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_NAME: process.env.DB_NAME || 'food_ordering',
  DB_USER: process.env.DB_USER || 'sagar',
  DB_PASSWORD: process.env.DB_PASSWORD || 'sagar123',
  DB_DIALECT: process.env.DB_DIALECT || 'mysql',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'eatnbite_access_token_secret_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'eatnbite_refresh_token_secret_key_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_TVs4txoK7Ntsai',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'zjSv5XI930RGPdoX1F9vr43M',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_eatnbite_test_secret_789',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
