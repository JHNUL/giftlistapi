import { gql } from 'apollo-server';

export const mutations = gql`
  type Mutation {
    addItem(itemInput: ItemInput!): Item!
    addUser(userInput: UserInput!): User
    addItemList(itemListInput: ItemListInput!): ItemList!
    reserveItem(reserveItemInput: ReserveItemInput!): Boolean
    releaseItem(releaseItemInput: ReleaseItemInput!): Boolean
    login(loginInput: LoginInput!): Token
    createPassword(createPasswordInput: CreatePasswordInput!): Token
  }
`;
