import 'reflect-metadata';
import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { connect } from 'mongoose';
import { config } from './config';
import { typeDefs } from './graphql/typedefs';
import { ItemResolver } from './resolvers/itemResolver';
import { UserResolver } from './resolvers/userResolver';

const init = async (): Promise<void> => {
  try {
    await connect(config.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connected to mongodb..');
    const server = new ApolloServer({ typeDefs, resolvers: [ItemResolver, UserResolver] });
    server.listen()
      .then(({ url }) => console.log(`Playground available at ${url}`))
      .catch(e => console.error(e));
  } catch (error) {
    console.error(error);
  }
};

void init();
