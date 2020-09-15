import { gql, IResolvers } from 'apollo-server';
import { User, Item, ItemInput } from './typedefs';

type RootType = | Item | User;

export interface ItemMutations extends IResolvers {
  Mutation: {
    addItem: (parent: RootType, args: ItemInput) => Promise<Item>
  }
}

export const mutations = gql`
type Mutation {
  addItem(itemInput: ItemInput!): Item!
}`;
