import { gql, IResolvers } from 'apollo-server';
import { User, Item, ItemInput, UserInput } from './typedefs';

type RootType = | Item | User;

export interface ItemMutations extends IResolvers {
  Mutation: {
    addItem: (parent: RootType, args: ItemInput) => Promise<Item>
  }
}

export interface UserMutations extends IResolvers {
  Mutation: {
    addUser: (parent: RootType, args: UserInput) => Promise<User>
  }
}

export const mutations = gql`
type Mutation {
  addItem(itemInput: ItemInput!): Item!
  addUser(userInput: UserInput!): User
}`;
