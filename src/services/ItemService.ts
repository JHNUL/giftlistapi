import { ApolloError } from 'apollo-server';
import mongoose from 'mongoose';
import { Service } from 'typedi';
import {
  Item,
  ItemInput,
  ReleaseItemInput,
  ReserveItemInput
} from '../graphql/types';
import { ItemRepository } from '../repositories/ItemRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './types';
import { objectIdsAreEqual } from './util';

@Service()
export class ItemService implements BaseService<Item> {
  constructor(
    private itemRepository: ItemRepository,
    private userRepository: UserRepository
  ) {}

  async findById(id: string): Promise<Item | undefined> {
    const res = await this.itemRepository.findById(id);
    return res?.toJSON();
  }

  async findAll(reserved?: boolean): Promise<Item[]> {
    const res = await this.itemRepository.findAll(reserved);
    return res.map((doc) => doc.toJSON());
  }

  async insert(itemInput: ItemInput): Promise<Item> {
    const res = await this.itemRepository.insert(itemInput);
    return res.toJSON();
  }

  async reserveItem(input: ReserveItemInput): Promise<boolean> {
    const item = await this.itemRepository.findById(
      input.reserveItemInput.itemId
    );
    const user = await this.userRepository.findById(
      input.reserveItemInput.userId,
      false
    );
    if (!item || !user) {
      throw new ApolloError('Item or user does not exist');
    }
    if (item.reserved) {
      throw new ApolloError('Item is already reserved');
    }
    item.reserved = true;
    const itemId = item._id as mongoose.Schema.Types.ObjectId;
    user.items = user.items ? [...user.items, itemId] : [itemId];
    await Promise.all([item.save(), user.save()]);
    return true;
  }

  async releaseItem(input: ReleaseItemInput): Promise<boolean> {
    const item = await this.itemRepository.findById(
      input.releaseItemInput.itemId
    );
    const user = await this.userRepository.findById(
      input.releaseItemInput.userId,
      false
    );
    if (!item || !user) {
      throw new ApolloError('Item or user does not exist');
    }
    if (!user.items?.find((i) => objectIdsAreEqual(i, item._id))) {
      throw new ApolloError(
        `User does not have item ${input.releaseItemInput.itemId} reserved`
      );
    }
    item.reserved = false;
    user.items = user.items.filter((i) => !objectIdsAreEqual(i, item._id));
    await Promise.all([item.save(), user.save()]);
    return true;
  }
}
