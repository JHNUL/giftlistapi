import mongoose from 'mongoose';
import { Service } from 'typedi';
import { ItemListInput } from '../graphql/types';
import { IItemListModel, ItemListModel } from '../models/ItemList';

@Service()
export class ItemListRepository {
  public async findById(
    id: string,
    populate = true
  ): Promise<IItemListModel | null> {
    if (!populate) {
      return await ItemListModel.findById(id);
    }
    return await ItemListModel.findById(id).populate('owner').populate('items');
  }

  public async findAll(): Promise<IItemListModel[]> {
    return await ItemListModel.find({});
  }

  public async insert(input: ItemListInput): Promise<IItemListModel> {
    const newItemList = new ItemListModel({
      ...input.itemListInput,
      owner: mongoose.Types.ObjectId(input.itemListInput.owner),
    });
    return await newItemList.save();
  }

  public async delete(id: string): Promise<boolean> {
    const res = await ItemListModel.findByIdAndDelete(id);
    return res !== null;
  }
}
