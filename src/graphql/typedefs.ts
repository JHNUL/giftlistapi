import { gql } from 'apollo-server';
import { queries } from './queries';
import { mutations } from './mutations';

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
  password: String!
  items: [Item!]!
}
type Token {
  value: String!
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
  password: String!
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
${mutations}`;
