import { gql } from 'apollo-server';

export const queries = gql`
  type Query {
    item(id: ID!): Item
    itemList(id: ID!): ItemList
    allItems(reserved: Boolean): [Item!]!
    user(id: ID!): User
    me(username: String!): User
    allUsers: [User!]!
  }
`;
