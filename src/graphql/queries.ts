import { gql, IResolvers } from 'apollo-server';
import { Item, User } from './typedefs';

type RootType = | Item | User;
type EntityIdArgs = {
  id: string
};
type AllItemArgs = {
  reserved?: boolean
};

export interface ItemQueries extends IResolvers {
  Query: {
    item: (parent: RootType, args: EntityIdArgs) => Promise<Item | undefined>
    allItems: (parent: RootType, args: AllItemArgs) => Promise<Item[] | undefined>
  }
}

export interface UserQueries extends IResolvers {
  Query: {
    user: (parent: RootType, args: EntityIdArgs) => Promise<User>
    allUsers: (parent: RootType, args?: any) => Promise<User[]>
  }
}

export const queries = gql`
type Query {
  item(id: ID!): Item
  allItems(reserved: Boolean): [Item!]!
}`;
