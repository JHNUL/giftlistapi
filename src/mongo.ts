import mongoose, { Mongoose } from 'mongoose';
import { config } from './config';

export const connectToDb = async (): Promise<Mongoose> => {
  return await mongoose.connect(config.dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    serverSelectionTimeoutMS: 5000,
  });
};

export const closeDbConnection = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};
