import { Service } from 'typedi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApolloError, AuthenticationError } from 'apollo-server';
import { config } from '../config';
import { LoginInput, User, UserInput, Token } from '../graphql/types';
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './types';

@Service()
export class UserService implements BaseService<User> {

  constructor(private userRepository: UserRepository) { }

  async findById(id: string): Promise<User | undefined> {
    const res = await this.userRepository.findById(id);
    return res?.toJSON();
  }

  async findAll(): Promise<User[]> {
    const res = await this.userRepository.findAll();
    return res.map(doc => doc.toJSON());
  }

  async insert(input: UserInput): Promise<User> {
    const { userInput } = input;
    userInput.password = bcrypt.hashSync(userInput.password, config.saltRounds);
    const res = await this.userRepository.insert(input);
    return res.toJSON();
  }

  async login(input: LoginInput): Promise<Token> {
    const { loginInput: { username, password } } = input;
    const user = await this.userRepository.findByUsername(username, false);
    if (!user) {
      throw new ApolloError(`No user found with username ${username}`);
    }
    if (bcrypt.compareSync(password, user.password)) {
      const takenToken = jwt.sign(
        { username, id: user.toJSON().id },
        config.secret,
        { expiresIn: config.tokenExpiry }
      );
      return {
        value: `Bearer ${takenToken}`
      };
    } else {
      throw new AuthenticationError('Password not correct');
    }
  }

}
