import { ApolloError, AuthenticationError } from 'apollo-server';
import bcrypt from 'bcrypt';
import { Service } from 'typedi';
import { config } from '../config';
import { LoginInput, Token, User, UserInput } from '../graphql/types';
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
    const plainPassword = input.userInput.password;
    if (plainPassword.length < 8) {
      throw new ApolloError('Password min length is 8 characters');
    }
    input.userInput.password = bcrypt.hashSync(
      plainPassword,
      config.saltRounds
    );
    const res = await this.userRepository.insert(input);
    return res.toJSON();
  }

  async login(input: LoginInput): Promise<Token> {
    const {
      loginInput: { username, password },
    } = input;
    const user = await this.userRepository.findByUsername(username, false);
    if (!user) {
      throw new ApolloError(`No user found with username ${username}`);
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new AuthenticationError('Password not correct');
    }
    return createToken(user.username, user.toJSON().id, user.role);
  }
}
