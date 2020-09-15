import { Service } from 'typedi';
import { Item, ItemInput } from '../graphql/typedefs';
import { ItemRepository } from '../repositories/ItemRepository';

interface BaseService<T> {
  findById: (id: string) => Promise<T | undefined>,
  findAll: () => Promise<T[]>
}

@Service()
export class ItemService implements BaseService<Item> {

  constructor(private itemRepository: ItemRepository) {}

  async findById(id: string): Promise<Item | undefined> {
    const res = await this.itemRepository.findById(id);
    return res?.toJSON();
  }

  async findAll(reserved?: boolean): Promise<Item[]> {
    const res = await this.itemRepository.findAll(reserved);
    return res.map(doc => doc.toJSON());
  }

  async insert(itemInput: ItemInput): Promise<Item> {
    const res = await this.itemRepository.insert(itemInput);
    return res.toJSON();
  }

}