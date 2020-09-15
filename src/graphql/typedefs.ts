import { gql } from 'apollo-server';
import { queries } from './queries';
import { mutations } from './mutations';

export interface User {
  name: string
  username: string
  password: string
  items: Array<Item>
}

export interface UserInput {
  name: string
  username: string
  password: string
}

export interface Item {
  id: string
  title: string,
  description?: string,
  url?: string,
  reservedBy?: User
}

export interface ItemInput {
  itemInput: {
    title: string,
    description?: string,
    url?: string,
  }
}

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
  TestUser = 'TESTUSER'
}

export const typeDefs = gql`
type Item {
  id: ID!
  title: String!
  description: String
  url: String
  reservedBy: User
}
input ItemInput {
  title: String!
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
input UserInput {
  name: String!
  username: String!
  password: String!
}
enum Role {
  USER
  ADMIN
  TESTUSER
}
${queries}
${mutations}`;
