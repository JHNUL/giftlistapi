import mongoose from 'mongoose';
import { Service } from 'typedi';
import { Item } from '../graphql/typedefs';
import { IItemModel } from '../models/ItemModel';

interface BaseService<T> {
  findById: (id: string) => Promise<T | undefined>,
  findAll: () => Promise<T[]>
}

@Service()
export class ItemService implements BaseService<Item> {

  constructor(private itemRepository: mongoose.Model<IItemModel>) { }

  async findById(id: string): Promise<Item | undefined> {
    const res = await this.itemRepository.findById(id);
    return res?.toJSON();
  }

  async findAll(): Promise<Item[]> {
    console.log('called?');
    const res = await this.itemRepository.find({});
    console.log(res.map(doc => doc.toJSON()));
    return res.map(doc => doc.toJSON());
  }

}