import 'reflect-metadata';
import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { connect } from 'mongoose';
import { typeDefs } from './graphql/typedefs';
import { ItemResolver } from './resolvers/itemResolver';

const dbUri = process.env.MONGODB_URI as string;

const init = async (): Promise<void> => {
  try {
    await connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connected to mongodb..');
    const server = new ApolloServer({ typeDefs, resolvers: ItemResolver });
    server.listen()
      .then(({ url }) => console.log(`Playground available at ${url}`))
      .catch(e => console.error(e));
  } catch (error) {
    console.error(error);
  }
};

void init();
