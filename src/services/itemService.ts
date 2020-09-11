import { v4 as createId } from 'uuid';
import { ItemBaseService, ItemCreateArguments } from './types';
import { EditItemInput, Item } from '../graphql/types';
import { items } from './data';

let instance: null | ItemService = null;

class ItemService implements ItemBaseService {

  constructor() {
    if (instance === null) {
      instance = this;
    }
    return instance;
  }

  async findAll(reserved = false): Promise<Item[]> {
    return await Promise.resolve(items.filter((i: Item) => {
      return reserved ? i.reservedBy : true;
    }));
  }

  async findById(id: string): Promise<Item | undefined> {
    return await Promise.resolve(items.find((i: Item) => i.id === id));
  }

  async createItem(item: ItemCreateArguments): Promise<Item> {
    const newItem: Item = {
      ...item,
      id: createId() // eslint-disable-line
    };
    items.push(newItem);
    return await Promise.resolve(newItem);
  }

  async deleteById(id: string): Promise<boolean> {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items.splice(i, 1);
        break;
      }
    }
    return await Promise.resolve(true);
  }

  async editItem(args: EditItemInput): Promise<Item|null> {
    let returnItem = null;
    items.forEach(item => {
      if (item.id === args.id) {
        item = { ...item, ...args };
        returnItem = { ...item };
      }
    });
    return Promise.resolve(returnItem);
  }

}

export default ItemService;



