import { IResolvers } from 'apollo-server';

export type RootType = Item | User;

export interface ItemMutations extends IResolvers {
  Mutation: {
    addItem: (parent: RootType, args: ItemInput) => Promise<Item>;
    reserveItem: (parent: RootType, args: ReserveItemInput) => Promise<boolean>;
    releaseItem: (parent: RootType, args: ReleaseItemInput) => Promise<boolean>;
  };
}

export interface RequestContext {
  id?: string;
  role?: Role;
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
    createPassword: (
      parent: RootType,
      args: CreatePasswordInput
    ) => Promise<Token>;
  };
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
  password?: string;
}

export interface UserInput {
  userInput: {
    name: string;
    username: string;
    role: Role;
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

export interface ItemInput {
  itemInput: {
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
    userId: string;
    itemId: string;
  };
}

export interface ReleaseItemInput {
  releaseItemInput: {
    userId: string;
    itemId: string;
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
