import 'reflect-metadata';
import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { buildSchema } from 'type-graphql';
import { connect } from 'mongoose';
import { ItemResolver } from './resolvers/itemResolver';

const dbUri = process.env.MONGODB_URI as string;

const init = async (): Promise<void> => {
  try {
    await connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connected to mongodb..');
    const schema = await buildSchema({
      resolvers: [ItemResolver],
      emitSchemaFile: './schema.sdl'
    });
    const server = new ApolloServer({ schema });
    server.listen()
      .then(({ url }) => console.log(`Playground available at ${url}`))
      .catch(e => console.error(e));
  } catch (error) {
    console.error(error);
  }
};

void init();
