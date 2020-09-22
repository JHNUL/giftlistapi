import { gql } from 'apollo-server';

export const queries = gql`
type Query {
  item(id: ID!): Item
  allItems(reserved: Boolean): [Item!]!
  user(id: ID!): User
  allUsers: [User!]!
}`;
