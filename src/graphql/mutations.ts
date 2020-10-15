import { gql } from 'apollo-server';

export const mutations = gql`
  type Mutation {
    addItem(itemInput: ItemInput!): Item!
    removeItem(removeItemInput: RemoveItemInput!): Boolean!
    addUser(userInput: UserInput!): User
    addItemList(itemListInput: ItemListInput!): ItemList!
    removeItemList(removeItemListInput: RemoveItemListInput!): Boolean!
    reserveItem(reserveItemInput: ReserveItemInput!): Boolean!
    releaseItem(releaseItemInput: ReleaseItemInput!): Boolean!
    login(loginInput: LoginInput!): Token
    createPassword(createPasswordInput: CreatePasswordInput!): Token
  }
`;
