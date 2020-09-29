import { Service } from 'typedi';
import bcrypt from 'bcrypt';
import { ApolloError, AuthenticationError } from 'apollo-server';
import { config } from '../config';
import {
  LoginInput,
  User,
  UserInput,
  Token,
  CreatePasswordInput,
} from '../graphql/types';
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './types';
import { createToken } from './util';

@Service()
export class UserService implements BaseService<User> {
  constructor(private userRepository: UserRepository) {}

  async findById(id: string): Promise<User | undefined> {
    const res = await this.userRepository.findById(id);
    return res?.toJSON();
  }

  async findByName(username: string): Promise<User | undefined> {
    const res = await this.userRepository.findByUsername(username);
    return res?.toJSON();
  }

  async findAll(): Promise<User[]> {
    const res = await this.userRepository.findAll();
    return res.map((doc) => doc.toJSON());
  }

  async insert(input: UserInput): Promise<User> {
    const res = await this.userRepository.insert(input);
    return res.toJSON();
  }

  async createPassword(input: CreatePasswordInput): Promise<Token> {
    const {
      createPasswordInput: { id, password },
    } = input;
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApolloError(`No user found with id ${id}`);
    }
    if (user.password) {
      throw new ApolloError('User already has password');
    }
    if (password.length < 8) {
      throw new ApolloError('Password min length is 8 characters');
    }
    user.password = bcrypt.hashSync(password, config.saltRounds);
    await user.save();
    return createToken(user.username, user.toJSON().id, user.role);
  }

  async login(input: LoginInput): Promise<Token> {
    const {
      loginInput: { username, password },
    } = input;
    const user = await this.userRepository.findByUsername(username, false);
    if (!user) {
      throw new ApolloError(`No user found with username ${username}`);
    }
    const matches =
      user.password && bcrypt.compareSync(password, user.password);
    if (!matches) {
      throw new AuthenticationError('Password not correct');
    }
    return createToken(user.username, user.toJSON().id, user.role);
  }
}
