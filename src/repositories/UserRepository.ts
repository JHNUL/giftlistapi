import mongoose from 'mongoose';
import { Service } from 'typedi';
import { UserInput } from '../graphql/types';
import { IUserModel, UserModel } from '../models/UserModel';

@Service()
export class UserRepository {
  async findById(id: string, populate = true): Promise<IUserModel | null> {
    const objectId = mongoose.Types.ObjectId(id);
    if (populate) {
      return await UserModel.findById(objectId).populate('items');
    }
    return await UserModel.findById(objectId);
  }

  async findAll(populate = true): Promise<IUserModel[]> {
    if (populate) {
      return await UserModel.find({}).populate('items');
    }
    return await UserModel.find({});
  }

  async findByUsername(
    username: string,
    populate = true
  ): Promise<IUserModel | null> {
    if (populate) {
      return await UserModel.findOne({ username }).populate('items');
    }
    return await UserModel.findOne({ username });
  }

  async insert(input: UserInput): Promise<IUserModel> {
    const { userInput } = input;
    const newUser = new UserModel(userInput);
    return await newUser.save();
  }
}
