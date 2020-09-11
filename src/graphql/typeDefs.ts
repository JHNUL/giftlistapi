import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export const typeDefs: DocumentNode = gql`
enum Role {
  USER
  TESTUSER
  ADMIN
}
type User {
  id: ID!
  name: String!
  username: String!
  role: Role!
  items: [Item!]
  password: String
}
type Item {
  id: ID!
  title: String!
  reservedBy: User
  description: String
  url: String
}
type Token {
  role: Role!
  name: String!
  value: String!
}
type Query {
  allUsers(role: Role): [User!]!
  allItems(reserved: Boolean): [Item!]!
  item(id: ID!): Item
  user(id: ID!): User
}
type Mutation {
  addUser(name: String!, username: String!, role: Role!, password: String!): User
  addItem(title: String!, description: String, url: String): Item!
  login(username: String!, password: String!): Token!
}`;
