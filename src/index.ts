import 'reflect-metadata';
import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { connectToDb } from './mongo';
import getServerConfig from './apollo';

const init = async (): Promise<void> => {
  try {
    await connectToDb();
    console.log('connected to mongodb..');
    const server = new ApolloServer(getServerConfig());
    const { url } = await server.listen({ port: process.env.PORT || 4000 });
    console.log(`Playground available at ${url}`);
  } catch (error) {
    console.error(error);
  }
};

void init();
