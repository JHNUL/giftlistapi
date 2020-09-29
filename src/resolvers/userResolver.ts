import { Container } from 'typedi';
import { Token, User, UserMutations, UserQueries } from '../graphql/types';
import { UserService } from '../services/UserService';

const userService = Container.get(UserService);

const userQueries: UserQueries = {
  Query: {
    user: async (_root, args): Promise<User | undefined> => {
      return await userService.findById(args.id);
    },
    allUsers: async (_root, _args): Promise<User[]> => {
      return await userService.findAll();
    },
    me: async (_root, args): Promise<User | undefined> => {
      return await userService.findByName(args.username);
    },
  },
};

const userMutations: UserMutations = {
  Mutation: {
    addUser: async (_root, args): Promise<User> => {
      return await userService.insert(args);
    },
    login: async (_root, args): Promise<Token> => {
      return await userService.login(args);
    }
  },
};

const UserResolver = {
  ...userQueries,
  ...userMutations,
};

export { UserResolver };
