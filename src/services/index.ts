import { Item, User, Role, ItemCreationArguments, UserCreationArguments } from '../models/interfaces';
import { v4 as createId } from 'uuid';

export const users: Array<User> = [
  {
    id: 'userId',
    name: 'Foouser',
    role: Role.User,
    username: 'FooUsername',
    items: ['234']
  },
  {
    id: 'userId2',
    name: 'Foouser2',
    role: Role.User,
    username: 'FooUsername2',
    items: []
  }
];

export const items: Array<Item> = [
  {
    id: '123',
    title: '1FOO!',
    reserved: false,
    description: 'f1oofoo'
  },
  {
    id: '234',
    title: '2FOO!',
    reserved: true,
    description: 'f2oofoo',
    url: 'http://foo.bar',
    reservedBy: 'userID'
  },
  {
    id: '345',
    title: '3FOO!',
    reserved: false,
    description: 'f3oofoo'
  },
  {
    id: '456',
    title: '4FOO!',
    reserved: false,
    description: 'f4oofoo'
  },
];

interface BaseService<T> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | undefined>
  create(args: ItemCreationArguments | UserCreationArguments): Promise<T>
}

export class UserService implements BaseService<User> {

  findAll = async (role?: Role): Promise<User[]> => {
    return await Promise.resolve(users.filter((u: User) => u.role === role));
  };

  findById = async (id: string): Promise<User | undefined> => {
    return await Promise.resolve(users.find((u: User) => u.id === id));
  };

  create = async (user: UserCreationArguments) => {
    const newUser: User = {
      ...user,
      id: createId() // eslint-disable-line
    };
    users.push(newUser);
    return Promise.resolve(newUser);
  };

}

export class ItemService implements BaseService<Item> {

  findAll = async (reserved = false): Promise<Item[]> => {
    return await Promise.resolve(items.filter((i: Item) => {
      return reserved ? i.reservedBy : true;
    }));
  };
  findById = async (id: string): Promise<Item | undefined> => {
    return await Promise.resolve(items.find((i: Item) => i.id === id));
  };

  create = async (item: ItemCreationArguments): Promise<Item> => {
    const newItem: Item = {
      ...item,
      id: createId() // eslint-disable-line
    };
    items.push(newItem);

    return await Promise.resolve(newItem);
  };
}




