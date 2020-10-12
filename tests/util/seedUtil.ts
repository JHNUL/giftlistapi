import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../../src/config';
import { Item, ItemList, Role, User } from '../../src/graphql/types';
import { ItemModel } from '../../src/models/Item';
import { ItemListModel } from '../../src/models/ItemList';
import { UserModel } from '../../src/models/User';

export const createUser = async (
  name: string,
  username: string,
  role: Role,
  password: string,
  items?: Array<Item>,
  itemLists?: Array<ItemList>
): Promise<User> => {
  const hash = bcrypt.hashSync(password, config.saltRounds);
  const testUser = new UserModel({
    name,
    username,
    password: hash,
    role,
    items,
    itemLists,
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

export const createItemList = async (
  name: string,
  identifier: string,
  owner: string,
  items?: Array<Item>
): Promise<ItemList> => {
  const testItemList = new ItemListModel({
    name,
    identifier,
    owner: mongoose.Types.ObjectId(owner),
    created: new Date(),
    items: items?.length ? items.map((i) => mongoose.Types.ObjectId(i.id)) : [],
  });
  const user = await UserModel.findById(owner);
  const savedItemList = await testItemList.save();
  user?.itemLists.push(savedItemList._id);
  await user?.save();
  return savedItemList.toJSON();
};
