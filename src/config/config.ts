import * as process from 'node:process';

export const Config = {
  DB_NAME: process.env.DB_NAME || 'bloggers-platform',
  DB_URI: process.env.DB_URI || 'mongodb://0.0.0.0:27017/bloggers-platform',
  TOKEN_SECRET_KEY: process.env.TOKEN_SECRET_KEY || '111',
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '30min',
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || '60min',
  GMAIL_PASS: process.env.GMAIL_PASS || '',
};
