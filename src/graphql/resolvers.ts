import { Queries, Mutations } from './types';
import { ItemService, UserService, LoginService } from '../services';

const itemService = new ItemService();
const userService = new UserService();
const loginService = new LoginService();

const queries: Queries = {
  allUsers: async (_, args) => {
    return await userService.findAll(args?.role);
  },
  user: async (_, args) => {
    return await userService.findById(args.id);
  },
  allItems: async (_, args) => {
    return await itemService.findAll(args?.reserved);
  },
  item: async (_, args) => {
    return itemService.findById(args.id);
  }
};

const mutations: Mutations = {
  addItem: async (_, args) => {
    return await itemService.createItem(args);
  },
  addUser: async (_, args) => {
    return await userService.createUser(args);
  },
  login: async (_, args) => {
    return await loginService.login(args.username, args.password);
  },
  editUser: async (_, args) => {
    return await userService.editUser(args);
  },
  editItem: async (_, args) => {
    return await itemService.editItem(args);
  },
  deleteItem: async (_, args) => {
    return await itemService.deleteById(args.id);
  },
  deleteUser: async (_, args) => {
    return await userService.deleteById(args.id);
  }
};

export const resolvers = {
  Query: { ...queries },
  Mutation: { ...mutations }
};
