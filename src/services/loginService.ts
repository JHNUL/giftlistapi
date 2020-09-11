import { LoginBaseService } from './types';
import { Token, Role } from '../graphql/types';

let instance: null | LoginService = null;

class LoginService implements LoginBaseService{

  constructor() {
    if (instance === null) {
      instance = this;
    }
    return instance;
  }

  async login(_username: string, _password: string): Promise<Token> {
    return await Promise.resolve({ role: Role.User, name: 'foo', value: 'tokenitokein'});
  }

}

export default LoginService;
