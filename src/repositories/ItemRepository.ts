import mongoose from 'mongoose';
import { Service } from 'typedi';
import { ItemInput } from '../graphql/types';
import { IItemModel, ItemModel } from '../models/ItemModel';

@Service()
export class ItemRepository {

  public async findById(id: string): Promise<IItemModel | null> {
    const objectId = mongoose.Types.ObjectId(id);
    return await ItemModel.findById(objectId);
  }

  public async findAll(reserved?: boolean): Promise<IItemModel[]> {
    const findConditions = typeof reserved === 'boolean'
      ? { reserved }
      : {};
    return await ItemModel.find(findConditions);
  }

  public async insert(input: ItemInput): Promise<IItemModel> {
    const newItem = new ItemModel(input.itemInput);
    return await newItem.save();
  }

}
