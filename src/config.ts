let mongoUri;
const NODE_ENV = process.env.NODE_ENV || '';

export enum Environment {
  Prod = 'prod',
  Dev = 'dev',
  Test = 'test'
}

let ENV: Environment = Environment.Prod;

if (NODE_ENV === 'production') {
  mongoUri = process.env.MONGODB_URI;
} else if (NODE_ENV === 'development') {
  mongoUri = process.env.MONGODB_URI_DEV;
  ENV = Environment.Dev;
} else if (['test', 'CI'].includes(NODE_ENV)) {
  mongoUri = process.env.MONGODB_URI_TEST;
  ENV = Environment.Test;
}

export const config = {
  dbUri: mongoUri || '',
  saltRounds: parseInt(process.env.SALT_ROUNDS || '') || 10,
  secret: process.env.SECRET || '',
  tokenExpiry: process.env.EXPIRY || '10 days',
  ENV,
};
