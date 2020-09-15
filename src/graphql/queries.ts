import { gql, IResolvers } from 'apollo-server';
import { Item, User } from './typedefs';

type RootType = | Item | User;
type EntityIdArgs = {
  id: string
};
type AllItemArgs = {
  reserved?: boolean
};

interface ItemQueryFunctions {
  item: (parent: RootType, args: EntityIdArgs) => Promise<Item | undefined>
  allItems: (parent: RootType, args: AllItemArgs) => Promise<Item[] | undefined>
}

export interface ItemQueries extends IResolvers {
  Query: ItemQueryFunctions
}

interface UserQueryFunctions {
  user: (parent: RootType, args: EntityIdArgs) => Promise<User>
  allUsers: (parent: RootType, args?: any) => Promise<User[]>
}

export interface UserQueries {
  Query: UserQueryFunctions
}

export const queries = gql`
type Query {
  item(id: ID!): Item
  user(id: ID!): User
  allItems(reserved: Boolean): [Item!]
  allUsers: [User!]!
}`;
