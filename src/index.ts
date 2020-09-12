import 'reflect-metadata';
import 'dotenv/config';
import { connect } from 'mongoose';
import UserModel from './models/UserModel';
import { UserInput } from './entities/userType';
import { Role } from './entities/role.enum';

const dbUri = process.env.MONGODB_URI as string;

const init = async (): Promise<void> => {
  try {
    await connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('connected to mongodb, cleaning..');
    const userInput: UserInput = {
      name: 'foo',
      username: 'fooer',
      password: 'pfsdpsdfds',
      items: [],
      role: Role.TestUser
    };
    const user = new UserModel(userInput);
    await user.save();
  } catch (error) {
    console.error(error);
  }
};

void init();
