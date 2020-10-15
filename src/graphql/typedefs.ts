import { gql } from 'apollo-server';
import { mutations } from './mutations';
import { queries } from './queries';

export const typeDefs = gql`
  scalar Date
  type ItemList {
    id: ID!
    name: String!
    identifier: String!
    items: [Item!]!
    owner: User!
    created: Date!
  }
  type Item {
    id: ID!
    title: String!
    reserved: Boolean!
    description: String
    url: String
  }
  type User {
    id: ID!
    name: String!
    username: String!
    items: [Item!]!
    itemLists: [ItemList!]!
    role: Role!
    password: String!
  }
  type Token {
    value: String!
  }
  input CreatePasswordInput {
    id: ID!
    password: String!
  }
  input LoginInput {
    username: String!
    password: String!
  }
  input ItemInput {
    listId: ID!
    title: String!
    description: String
    url: String
  }
  input RemoveItemListInput {
    listId: ID!
  }
  input UserInput {
    name: String!
    username: String!
    role: Role!
    password: String!
  }
  input ReserveItemInput {
    itemId: ID!
    listId: ID!
  }
  input ReleaseItemInput {
    itemId: ID!
    listId: ID!
  }
  input RemoveItemInput {
    itemId: ID!
    listId: ID!
  }
  input ItemListInput {
    name: String!
    identifier: String!
    owner: ID!
  }
  enum Role {
    USER
    ADMIN
    TESTUSER
  }
  ${queries}
  ${mutations}
`;
