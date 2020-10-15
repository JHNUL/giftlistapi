import { Service } from 'typedi';
import { ItemInput } from '../graphql/types';
import { IItemModel, ItemModel } from '../models/Item';

@Service()
export class ItemRepository {
  public async findById(id: string): Promise<IItemModel | null> {
    return await ItemModel.findById(id);
  }

  public async findAll(reserved?: boolean): Promise<IItemModel[]> {
    const findConditions = typeof reserved === 'boolean' ? { reserved } : {};
    return await ItemModel.find(findConditions);
  }

  public async insert(input: ItemInput): Promise<IItemModel> {
    // eslint-disable-next-line
    const { listId, ...rest } = input.itemInput;
    const newItem = new ItemModel(rest);
    return await newItem.save();
  }

  public async delete(id: string): Promise<boolean> {
    const res = await ItemModel.findByIdAndDelete(id);
    return res !== null;
  }
}
