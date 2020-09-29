import {
  ApolloServerExpressConfig,
  AuthenticationError,
} from 'apollo-server-express';
import { IncomingHttpHeaders } from 'http';
import jwt from 'jsonwebtoken';
import { config, Environment } from './config';
import { typeDefs } from './graphql/typedefs';
import { RequestContext } from './graphql/types';
import { UserModel } from './models/UserModel';
import { DateResolver } from './resolvers/dateResolver';
import { ItemResolver } from './resolvers/itemResolver';
import { UserResolver } from './resolvers/userResolver';

const isTestEnv = config.ENV === Environment.Test;

const getServerConfig = (
  testHeaderObject?: IncomingHttpHeaders
): ApolloServerExpressConfig => {
  return {
    typeDefs,
    resolvers: [DateResolver, ItemResolver, UserResolver],
    introspection: true,
    playground: true,
    context: async ({ req }): Promise<RequestContext> => {
      // KLUDGE: currently apollo-server-testing does not allow to pass request object
      const headers =
        isTestEnv && testHeaderObject !== undefined
          ? testHeaderObject
          : req.headers;
      let context = {};
      if (headers.authorization) {
        const token = headers.authorization.substring(7);
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
};

export default getServerConfig;
