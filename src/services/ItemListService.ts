import { ApolloError } from 'apollo-server';
import mongoose from 'mongoose';
import { Service } from 'typedi';
import {
  ItemList,
  ItemListInput,
  RemoveItemListInput,
  RequestContext,
} from '../graphql/types';
import { ItemListRepository } from '../repositories/ItemListRepository';
import { ItemRepository } from '../repositories/ItemRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './types';

@Service()
export class ItemListService implements BaseService<ItemList> {
  constructor(
    private itemListRepository: ItemListRepository,
    private itemRepository: ItemRepository,
    private userRepository: UserRepository
  ) {}

  async findById(id: string): Promise<ItemList | undefined> {
    const res = await this.itemListRepository.findById(id);
    return res?.toJSON();
  }

  async findAll(): Promise<ItemList[]> {
    const res = await this.itemListRepository.findAll();
    return res.map((doc) => doc.toJSON());
  }

  async insert(
    input: ItemListInput,
    ctx: RequestContext
  ): Promise<ItemList | undefined> {
    const userId = ctx.id as string; // already checked
    const { itemListInput } = input;
    itemListInput.created = new Date();
    itemListInput.owner = userId;
    const res = await this.itemListRepository.insert(input);
    const itemList = await this.itemListRepository.findById(res?.toJSON().id);
    const user = await this.userRepository.findById(userId);
    user?.itemLists.push(itemList?._id);
    await user?.save();
    return itemList?.toJSON();
  }

  async delete(
    input: RemoveItemListInput,
    ctx: RequestContext
  ): Promise<boolean> {
    const userId = ctx.id as string; // already checked
    const { removeItemListInput } = input;
    const itemList = await this.itemListRepository.findById(
      removeItemListInput.listId,
      false
    );
    if (!itemList) {
      throw new ApolloError('Itemlist not found');
    }
    if (itemList.owner.toString() !== userId) {
      throw new ApolloError('Only owner can delete itemlist');
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // delete all items that belong to the list
      await Promise.all(itemList.items.map(itemId => this.itemListRepository.delete(itemId.toString())))
      await this.itemListRepository.delete(itemList.id);
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      return false;
    } finally {
      session.endSession();
    }
  }
}
