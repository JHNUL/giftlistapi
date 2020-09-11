import { Queries, Mutations } from '../models/interfaces';
import * as service from '../services/index';

const queries: Queries = {
  allUsers: async (_, args) => {
    return await service.findUsers(args.role);
  },
  allItems: async (_, args) => {
    return await service.findItems(args.reserved);
  },
  user: async (_, args) => {
    return await service.findUser(args.id);
  },
  item: async (_, args) => {
    return service.findItem(args.id);
  }
};

const mutations: Mutations = {
  addItem: async (_, args) => {
    return await service.createItem(args);
  }
}

export const resolvers = {
  Query: { ... queries }
};
