import { v4 as createId } from 'uuid';
import { UserBaseService, UserCreateArguments } from './types';
import { User, Role, EditUserInput } from '../graphql/types';
import { users } from './data';

let instance: null | UserService = null;

class UserService implements UserBaseService {

  constructor() {
    if (instance === null) {
      instance = this;
    }
    return instance;
  }

  async findAll(role?: Role): Promise<User[]> {
    return await Promise.resolve(users.filter((u: User) => u.role === role));
  }

  async findById(id: string): Promise<User | undefined> {
    return await Promise.resolve(users.find((u: User) => u.id === id));
  }

  async createUser(user: UserCreateArguments): Promise<User> {
    const newUser: User = {
      ...user,
      id: createId() // eslint-disable-line
    };
    users.push(newUser);
    return Promise.resolve(newUser);
  }

  async deleteById(id: string): Promise<boolean> {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        users.splice(i, 1);
        break;
      }
    }
    return await Promise.resolve(true);
  }

  async editUser(args: EditUserInput): Promise<User | null> {
    let returnUser = null;
    users.forEach(user => {
      if (user.id === args.id) {
        user = { ...user, ...args };
        returnUser = { ...user };
      }
    });
    return Promise.resolve(returnUser);
  }

}

export default UserService;