import jwt from 'jsonwebtoken';
import {
  ApolloServerExpressConfig,
  AuthenticationError,
} from 'apollo-server-express';
import { ItemResolver } from './resolvers/itemResolver';
import { UserResolver } from './resolvers/userResolver';
import { typeDefs } from './graphql/typedefs';
import { RequestContext } from './graphql/types';
import { config } from './config';
import { UserModel } from './models/UserModel';

const serverConfig: ApolloServerExpressConfig = {
  typeDefs,
  resolvers: [ItemResolver, UserResolver],
  introspection: true,
  playground: true,
  context: async ({ req }): Promise<RequestContext> => {
    let context = {};
    if (req.headers.authorization) {
      const token = req.headers.authorization.substring(7);
      const decoded = jwt.verify(token, config.secret) as RequestContext;
      const user = await UserModel.findById(decoded?.id);
      if (!user) {
        throw new AuthenticationError('Invalid token');
      }
      const userJson = user.toJSON();
      context = { id: userJson.id, role: userJson.role };
    }
    return await Promise.resolve(context);
  },
};

export default serverConfig;
