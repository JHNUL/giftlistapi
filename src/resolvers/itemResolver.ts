import { Container } from 'typedi';
import { Item } from '../graphql/typedefs';
import { ItemQueries } from '../graphql/queries';
import { ItemService } from '../services/ItemService';
import { ItemMutations } from '../graphql/mutations';

const itemService = Container.get(ItemService);

const itemQueries: ItemQueries = {
  Query: {
    item: async (_root, args): Promise<Item | undefined> => {
      return await itemService.findById(args.id);
    },
    allItems: async (_root, args): Promise<Item[]> => {
      return await itemService.findAll(args.reserved);
    }
  }
};


const itemMutations: ItemMutations = {
  Mutation: {
    addItem: async (_root, args): Promise<Item> => {
      return await itemService.insert(args);
    }
  }
};

const ItemResolver = {
  ...itemQueries,
  ...itemMutations
};

export { ItemResolver };
