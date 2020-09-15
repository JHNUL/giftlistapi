import mongoose from 'mongoose';
import { Service } from 'typedi';
import { ItemInput } from '../graphql/typedefs';
import { IItemModel, ItemModel } from '../models/ItemModel';

@Service()
export class ItemRepository {

  async findById(id: string): Promise<IItemModel | null> {
    const objectId = mongoose.Types.ObjectId(id);
    return await ItemModel.findById(objectId);
  }

  async findAll(reserved?: boolean): Promise<IItemModel[]> {
    const findConditions = typeof reserved === 'boolean'
      ? reserved ? { 'reservedBy': { $exists: true } } : { 'reservedBy': { $exists: false } }
      : {};
    return await ItemModel.find(findConditions);
  }

  async insert(input: ItemInput): Promise<IItemModel> {
    const newItem = new ItemModel(input.itemInput);
    return await newItem.save();
  }

}