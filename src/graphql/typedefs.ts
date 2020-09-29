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
    created: String!
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
    title: String!
    description: String
    url: String
  }
  input UserInput {
    name: String!
    username: String!
    role: Role!
    password: String!
  }
  input ReserveItemInput {
    itemId: ID!
    userId: ID!
  }
  input ReleaseItemInput {
    itemId: ID!
    userId: ID!
  }
  input ItemListInput {
    name: String!
    identifier: String!
  }
  enum Role {
    USER
    ADMIN
    TESTUSER
  }
  ${queries}
  ${mutations}
`;
