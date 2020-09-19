import { Container } from 'typedi';
import { User } from '../graphql/typedefs';
import { UserQueries } from '../graphql/queries';
import { UserService } from '../services/UserService';
import { UserMutations } from '../graphql/mutations';

const userService = Container.get(UserService);


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
