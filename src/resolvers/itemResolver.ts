import { Container } from 'typedi';
import { Item, ItemMutations, ItemQueries } from '../graphql/types';
import { ItemService } from '../services/ItemService';

const itemService = Container.get(ItemService);

const itemQueries: ItemQueries = {
  Query: {
    item: async (_root, args): Promise<Item | undefined> => {
      return await itemService.findById(args.id);
    },
    allItems: async (_root, args): Promise<Item[]> => {
      return await itemService.findAll(args.reserved);
    },
  },
};

const itemMutations: ItemMutations = {
  Mutation: {
    addItem: async (_root, args): Promise<Item> => {
      return await itemService.insert(args);
    },
    reserveItem: async (_root, args): Promise<boolean> => {
      return await itemService.reserveItem(args);
    },
    releaseItem: async (_root, args): Promise<boolean> => {
      return await itemService.releaseItem(args);
    },
  },
};

const ItemResolver = {
  ...itemQueries,
  ...itemMutations,
};

export { ItemResolver };
