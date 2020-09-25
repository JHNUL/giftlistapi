import { Item, Role, User } from '../../src/graphql/types';
import { ItemModel } from '../../src/models/ItemModel';
import { UserModel } from '../../src/models/UserModel';

export const createUser = async (
  name: string,
  username: string,
  role: Role,
  password?: string,
  items?: Array<Item>
): Promise<User> => {
  const testUser = new UserModel({
    name,
    username,
    password,
    role,
    items,
  });
  const savedUser = await testUser.save();
  return savedUser.toJSON();
};

export const createItem = async (
  title: string,
  reserved: boolean,
  description?: string,
  url?: string
): Promise<Item> => {
  const testItem = new ItemModel({
    title,
    reserved,
    description,
    url,
  });
  const savedItem = await testItem.save();
  return savedItem.toJSON();
};
