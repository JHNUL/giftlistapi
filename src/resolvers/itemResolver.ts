import { Container } from 'typedi';
import { Item } from '../graphql/typedefs';
import { ItemQueries } from '../graphql/queries';
import { ItemService } from '../services/ItemService';

const itemRepo = Container.get(ItemService);

const itemQueries: ItemQueries = {
  Query: {
    item: async (_root, args): Promise<Item | undefined> => {
      return await itemRepo.findById(args.id);
    },
    allItems: async (): Promise<Item[]> => {
      console.log('caller resolver?');
      return await itemRepo.findAll();
    }
  }
};

const ItemResolver = {
  ...itemQueries
};

export { ItemResolver };
