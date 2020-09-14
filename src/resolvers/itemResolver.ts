import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { ApolloError } from 'apollo-server';

import { ItemService } from '../services/ItemService';
import { Item, ItemInput } from '../entities/itemType';

@Resolver(Item)
class ItemResolver {
  constructor(private itemService: ItemService) {}

  @Query(_returns => Item)
  async item(@Arg('id') id: string): Promise<Item> {
    const item = await this.itemService.findById(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }
    return item;
  }

  @Mutation(_retuns => Item)
  async addItem(@Arg('itemInput') itemInput: ItemInput): Promise<Item> {
    const item = await this.itemService.addNewItem(itemInput);
    if (!item) {
      throw new Error('Could not add new item');
    }
    return item;
  }
}

