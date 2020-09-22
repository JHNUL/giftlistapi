
export const config = {
  dbUri: process.env.MONGODB_URI || '',
  saltRounds: parseInt(process.env.SALT_ROUNDS || '') || 10,
  secret: process.env.SECRET || '',
  tokenExpiry: process.env.EXPIRY || '',
};
