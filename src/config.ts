let mongoUri;

if (process.env.NODE_ENV === 'production') {
  mongoUri = process.env.MONGODB_URI;
} else if (process.env.NODE_ENV === 'development') {
  mongoUri = process.env.MONGODB_URI_DEV;
} else if (process.env.NODE_ENV === 'test') {
  mongoUri = process.env.MONGODB_URI_TEST;
}

export const config = {
  dbUri: mongoUri || '',
  saltRounds: parseInt(process.env.SALT_ROUNDS || '') || 10,
  secret: process.env.SECRET || '',
  tokenExpiry: process.env.EXPIRY || '',
};
