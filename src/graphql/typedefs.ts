import { gql } from 'apollo-server';
import { mutations } from './mutations';
import { queries } from './queries';

export const typeDefs = gql`
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
    role: Role
    password: String
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
  }
  input ReserveItemInput {
    itemId: ID!
    userId: ID!
  }
  input ReleaseItemInput {
    itemId: ID!
    userId: ID!
  }
  enum Role {
    USER
    ADMIN
    TESTUSER
  }
  ${queries}
  ${mutations}
`;
