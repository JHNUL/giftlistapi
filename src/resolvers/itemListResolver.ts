import { AuthenticationError } from 'apollo-server';
import { Container } from 'typedi';
import { ItemList, ItemListMutations } from '../graphql/types';
import { ItemListService } from '../services/ItemListService';

const itemListService = Container.get(ItemListService);

const itemListMutations: ItemListMutations = {
  Mutation: {
    addItemList: async (_root, args, ctx): Promise<ItemList | undefined> => {
      if (!ctx.id || !ctx.role) {
        throw new AuthenticationError('User must be authenticated');
      }
      return await itemListService.insert(args, ctx);
    }
  },
};

const ItemListResolver = {
  ...itemListMutations,
};

export { ItemListResolver };
