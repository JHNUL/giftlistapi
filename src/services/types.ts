import { Item, User, Token, EditUserInput, EditItemInput } from '../graphql/types';

export interface BaseService<T> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | undefined>
  deleteById(id: string): Promise<boolean>
}

export type ItemCreateArguments = Omit<Item, 'id' | 'reservedBy'>;

export interface ItemBaseService extends BaseService<Item> {
  createItem(args: ItemCreateArguments): Promise<Item>
  editItem(args: EditItemInput): Promise<Item|null>
}

export type UserCreateArguments = Omit<User, 'id'>;

export interface UserBaseService extends BaseService<User> {
  createUser(args: UserCreateArguments): Promise<User | null>
  editUser(args: EditUserInput): Promise<User | null>
}

export interface LoginBaseService {
  login(username: string, password: string): Promise<Token>
}
