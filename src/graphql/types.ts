import { IResolvers } from 'apollo-server';

export type RootType = undefined;

export interface ItemListMutations extends IResolvers {
  Mutation: {
    addItemList: (
      parent: RootType,
      args: ItemListInput,
      context: RequestContext
    ) => Promise<ItemList | undefined>;
    removeItemList: (
      parent: RootType,
      args: RemoveItemListInput,
      context: RequestContext
    ) => Promise<boolean>;
  };
}

export interface ItemMutations extends IResolvers {
  Mutation: {
    addItem: (
      parent: RootType,
      args: ItemInput,
      context: RequestContext
    ) => Promise<Item>;
    reserveItem: (
      parent: RootType,
      args: ReserveItemInput,
      context: RequestContext
    ) => Promise<boolean>;
    releaseItem: (
      parent: RootType,
      args: ReleaseItemInput,
      context: RequestContext
    ) => Promise<boolean>;
    removeItem: (
      parent: RootType,
      args: RemoveItemInput,
      context: RequestContext
    ) => Promise<boolean>;
  };
}

export interface ItemQueries extends IResolvers {
  Query: {
    item: (parent: RootType, args: EntityIdArgs) => Promise<Item | undefined>;
    allItems: (
      parent: RootType,
      args: AllItemArgs,
      context: RequestContext
    ) => Promise<Item[]>;
  };
}

export interface ItemListQueries extends IResolvers {
  Query: {
    itemList: (
      parent: RootType,
      args: EntityIdArgs,
      context: RequestContext
    ) => Promise<ItemList | undefined>;
  };
}

export interface UserQueries extends IResolvers {
  Query: {
    user: (parent: RootType, args: EntityIdArgs) => Promise<User | undefined>;
    allUsers: (parent: RootType, args: AnyArgs) => Promise<User[]>;
    me: (parent: RootType, args: UsernameArgs) => Promise<User | undefined>;
  };
}

export interface UserMutations extends IResolvers {
  Mutation: {
    addUser: (parent: RootType, args: UserInput) => Promise<User | undefined>;
    login: (parent: RootType, args: LoginInput) => Promise<Token>;
  };
}

export interface RequestContext {
  id?: string;
  role?: Role;
}

export type EntityIdArgs = {
  id: string;
};

export type UsernameArgs = {
  username: string;
};

export type AllItemArgs = {
  reserved?: boolean;
};

export type AnyArgs = {
  [key: string]: string;
};

export interface User {
  name: string;
  username: string;
  id: string;
  role: Role;
  items: Array<Item>;
  itemLists: Array<ItemList>;
  password: string;
}

export interface UserInput {
  userInput: {
    name: string;
    username: string;
    role: Role;
    password: string;
  };
}

export interface CreatePasswordInput {
  createPasswordInput: {
    id: string;
    password: string;
  };
}

export interface Item {
  id: string;
  title: string;
  reserved: boolean;
  description?: string;
  url?: string;
}

export interface ItemList {
  id: string;
  name: string;
  identifier: string;
  items: Array<Item>;
  created: Date;
  owner: User;
}

export interface ItemInput {
  itemInput: {
    listId: string;
    title: string;
    description?: string;
    url?: string;
  };
}

export interface LoginInput {
  loginInput: {
    username: string;
    password: string;
  };
}

export interface ReserveItemInput {
  reserveItemInput: {
    itemId: string;
    listId: string;
  };
}

export interface ReleaseItemInput {
  releaseItemInput: {
    itemId: string;
    listId: string;
  };
}

export interface RemoveItemInput {
  removeItemInput: {
    itemId: string;
    listId: string;
  };
}

export interface ItemListInput {
  itemListInput: {
    name: string;
    identifier: string;
    owner: string;
    created?: Date;
  };
}

export interface RemoveItemListInput {
  removeItemListInput: {
    listId: string;
  };
}

export interface Token {
  value: string;
}

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
  TestUser = 'TESTUSER',
}
