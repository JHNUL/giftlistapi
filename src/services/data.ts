import { Item, User, Role } from '../graphql/types';

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
    reservedBy: users[1]
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