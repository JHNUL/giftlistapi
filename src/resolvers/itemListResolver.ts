import { Container } from 'typedi';
import { ItemList, ItemListMutations } from '../graphql/types';
import { ItemListService } from '../services/ItemListService';

const itemListService = Container.get(ItemListService);

const itemListMutations: ItemListMutations = {
  Mutation: {
    addItemList: async (_root, args, ctx): Promise<ItemList> => {
      return await itemListService.insert(args, ctx);
    },
  },
};

const ItemListResolver = {
  ...itemListMutations,
};

export { ItemListResolver };
