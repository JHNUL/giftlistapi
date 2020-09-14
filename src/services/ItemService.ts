import { Item, ItemInput } from '../entities/itemType';
import ItemModel from '../models/ItemModel';

export class ItemService {

  async findById(id: string): Promise<Item|null> {
    return Promise.resolve(null);
  }
  async addNewItem(itemInput: ItemInput): Promise<Item|null> {
    const newItem = new ItemModel(itemInput);
    const savedItem = await newItem.save();
    console.log('ItemService.ts line:12 ', savedItem);
    return Promise.resolve(null);
  }
}