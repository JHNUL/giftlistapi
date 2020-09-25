import { ItemResolver } from './resolvers/itemResolver';
import { UserResolver } from './resolvers/userResolver';
import { typeDefs } from './graphql/typedefs';


export default {
  typeDefs,
  resolvers: [ItemResolver, UserResolver],
  introspection: true,
  playground: true
};
