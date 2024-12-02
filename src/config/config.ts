import * as process from 'node:process';

export const Config = {
  DB_NAME: process.env.DB_NAME || 'bloggers-platform',
  DB_URI: 'mongodb://localhost/bloggers-platform',
};
