import * as process from 'node:process';

export class Config {
  static DB_NAME: string = process.env.DB_NAME || 'bloggers-platform';
  static DB_URI: string = process.env.DB_URI || 'mongodb://localhost:27017';
}
