import mongoose from 'mongoose';
import { Service } from 'typedi';
import { ItemListInput } from '../graphql/types';
import { IItemListModel, ItemListModel } from '../models/ItemList';

@Service()
export class ItemListRepository {
  public async findById(id: string): Promise<IItemListModel | null> {
    const objectId = mongoose.Types.ObjectId(id);
    return await ItemListModel.findById(objectId);
  }

  public async findAll(): Promise<IItemListModel[]> {
    return await ItemListModel.find({});
  }

  public async insert(input: ItemListInput): Promise<IItemListModel> {
    const newItemList = new ItemListModel(input.itemListInput);
    return await newItemList.save();
  }
}
