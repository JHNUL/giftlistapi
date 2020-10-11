import { ApolloError, AuthenticationError } from 'apollo-server';
import mongoose from 'mongoose';
import { Service } from 'typedi';
import {
  Item,
  ItemInput,
  ReleaseItemInput,
  RequestContext,
  ReserveItemInput,
} from '../graphql/types';
import { ItemListRepository } from '../repositories/ItemListRepository';
import { ItemRepository } from '../repositories/ItemRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './types';
import { objectIdsAreEqual } from './util';

@Service()
export class ItemService implements BaseService<Item> {
  constructor(
    private itemRepository: ItemRepository,
    private userRepository: UserRepository,
    private itemListRepository: ItemListRepository
  ) {}

  async findById(id: string): Promise<Item | undefined> {
    const res = await this.itemRepository.findById(id);
    return res?.toJSON();
  }

  async findAll(reserved?: boolean): Promise<Item[]> {
    const res = await this.itemRepository.findAll(reserved);
    return res.map((doc) => doc.toJSON());
  }

  async insert(input: ItemInput, ctx: RequestContext): Promise<Item> {
    const userId = ctx.id as string; // already checked
    const itemList = await this.itemListRepository.findById(
      input.itemInput.listId,
      false
    );
    if (!itemList) {
      throw new ApolloError('Itemlist not found');
    }
    if (userId !== itemList.owner.toString()) {
      throw new AuthenticationError('Only owner can add item to list');
    }
    const res = await this.itemRepository.insert(input);
    itemList.items.push(res._id);
    await itemList.save();
    return res.toJSON();
  }

  async reserveItem(
    input: ReserveItemInput,
    ctx: RequestContext
  ): Promise<boolean> {
    const userId = ctx.id as string; // already checked
    const item = await this.itemRepository.findById(
      input.reserveItemInput.itemId
    );
    const user = await this.userRepository.findById(userId, false);
    const itemList = await this.itemListRepository.findById(
      input.reserveItemInput.listId,
      false
    );
    if (!item) {
      throw new ApolloError('Item does not exist');
    }
    if (!user) {
      throw new ApolloError('User does not exist');
    }
    if (!itemList) {
      throw new ApolloError('ItemList does not exist');
    }
    if (item.reserved) {
      throw new ApolloError('Item is already reserved');
    }
    const itemIsInList = itemList.items.some(
      (i) => i.toString() === input.reserveItemInput.itemId
    );
    if (!itemIsInList) {
      throw new ApolloError('Item not found in itemlist');
    }
    const userHasAccessToList = user.itemLists.some(
      (i) => i.toString() === input.reserveItemInput.listId
    );
    if (!userHasAccessToList) {
      throw new ApolloError("User does not have access to item's list");
    }
    item.reserved = true;
    const itemId = item._id as mongoose.Schema.Types.ObjectId;
    user.items = user.items ? [...user.items, itemId] : [itemId];
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await item.save();
      await user.save();
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      return false;
    } finally {
      session.endSession();
    }
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
