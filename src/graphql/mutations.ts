import { gql } from 'apollo-server';
import { ItemInput, Item, UserInput, User } from './typedefs';

export interface ItemMutations {
  addItem: (itemInput: ItemInput) => Promise<Item>
}

export interface UserMutations {
  addUser: (userInput: UserInput) => Promise<User | null>
}

export const mutations = gql`
type Mutation {
  addItem(itemInput: ItemInput): Item!
  addUser(userInput: UserInput): User
}`;
