import { AuthenticationError } from 'apollo-server';
import { Container } from 'typedi';
import {
  AllItemArgs,
  EntityIdArgs,
  Item,
  ItemInput,
  ItemMutations,
  ItemQueries,
  ReleaseItemInput,
  RequestContext,
  ReserveItemInput,
} from '../graphql/types';
import { ItemService } from '../services/ItemService';

const itemService = Container.get(ItemService);

const itemQueries: ItemQueries = {
  Query: {
    item: async (_root, args: EntityIdArgs): Promise<Item | undefined> => {
      return await itemService.findById(args.id);
    },
    allItems: async (_root, args: AllItemArgs): Promise<Item[]> => {
      return await itemService.findAll(args.reserved);
    },
  },
};

const itemMutations: ItemMutations = {
  Mutation: {
    addItem: async (
      _root,
      args: ItemInput,
      ctx: RequestContext
    ): Promise<Item> => {
      if (!ctx.id || !ctx.role) {
        throw new AuthenticationError('User must be authenticated');
      }
      return await itemService.insert(args, ctx);
    },
    reserveItem: async (
      _root,
      args: ReserveItemInput,
      ctx: RequestContext
    ): Promise<boolean> => {
      if (!ctx.id || !ctx.role) {
        throw new AuthenticationError('User must be authenticated');
      }
      return await itemService.reserveItem(args, ctx);
    },
    releaseItem: async (
      _root,
      args: ReleaseItemInput,
      ctx: RequestContext
    ): Promise<boolean> => {
      return await itemService.releaseItem(args, ctx);
    },
  },
};

const ItemResolver = {
  ...itemQueries,
  ...itemMutations,
};

export { ItemResolver };
