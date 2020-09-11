export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
  TestUser = 'TESTUSER'
}

export interface User {
  id: string
  name: string
  username: string
  role: Role
  items?: Array<string>
  password?: string
}

export interface Item {
  id: string
  title: string
  reservedBy?: User
  description?: string
  url?: string
}

export interface Token {
  role: Role
  name: string
  value: string
}

type RootType = | Item | User;

interface UsersResolverArgs {
  role?: Role
}

interface ItemsResolverArgs {
  reserved?: boolean
}

interface EntityIdResolverArgs {
  id: string
}

export interface Queries {
  allUsers: (parent: RootType, args: UsersResolverArgs) => Promise<User[]>
  allItems: (parent: RootType, args: ItemsResolverArgs) => Promise<Item[]>
  item: (parent: RootType, args: EntityIdResolverArgs) => Promise<Item | undefined>
  user: (parent: RootType, args: EntityIdResolverArgs) => Promise<User | undefined>
}

export type ItemCreationArguments = Omit<Item, 'id'>;
export type UserCreationArguments = Omit<User, 'id'>;

interface LoginArguments {
  username: string
  password: string
}

export interface Mutations {
  addItem: (parent: RootType, args: ItemCreationArguments) => Promise<Item>
  addUser: (parent: RootType, args: UserCreationArguments) => Promise<User | undefined>
  login: (parent: RootType, args: LoginArguments) => Promise<Token>
  editUser: (parent: RootType, args: EditUserInput) => Promise<User | null>
  editItem: (parent: RootType, args: EditItemInput) => Promise<Item | null>
  deleteItem: (parent: RootType, args: EntityIdResolverArgs) => Promise<boolean>
  deleteUser: (parent: RootType, args: EntityIdResolverArgs) => Promise<boolean>
}

export interface EditUserInput {
  id: string
  name?: string
  username?: string
  role?: Role
  password?: string
}

export interface EditItemInput {
  id: string
  title?: string
  reservedBy?: User
  description?: string
  url?: string
}
