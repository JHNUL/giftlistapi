import { AuthenticationError } from 'apollo-server';
import { Container } from 'typedi';
import { ItemList, ItemListMutations, ItemListQueries } from '../graphql/types';
import { ItemListService } from '../services/ItemListService';

const itemListService = Container.get(ItemListService);

const itemListMutations: ItemListMutations = {
  Mutation: {
    addItemList: async (_root, args, ctx): Promise<ItemList | undefined> => {
      if (!ctx.id || !ctx.role) {
        throw new AuthenticationError('User must be authenticated');
      }
      return await itemListService.insert(args, ctx);
    },
    removeItemList: async (_root, args, ctx): Promise<boolean> => {
      if (!ctx.id || !ctx.role) {
        throw new AuthenticationError('User must be authenticated');
      }
      return await itemListService.delete(args, ctx);
    }
  },
};

const itemListQueries: ItemListQueries = {
  Query: {
    itemList: async (_root, args, ctx): Promise<ItemList | undefined> => {
      if (!ctx.id || !ctx.role) {
        throw new AuthenticationError('User must be authenticated');
      }
      return await itemListService.findById(args.id);
    }
  }
}

const ItemListResolver = {
  ...itemListMutations,
  ...itemListQueries
};

export { ItemListResolver };
