import { AuthenticationError } from 'apollo-server';
import { Service } from 'typedi';
import { ItemList, ItemListInput, RequestContext } from '../graphql/types';
import { ItemListRepository } from '../repositories/ItemListRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BaseService } from './types';

@Service()
export class ItemListService implements BaseService<ItemList> {
  constructor(
    private itemListRepository: ItemListRepository,
    private userRepository: UserRepository
  ) {}

  async findById(id: string): Promise<ItemList | undefined> {
    const res = await this.itemListRepository.findById(id);
    return res?.toJSON();
  }

  async findAll(): Promise<ItemList[]> {
    const res = await this.itemListRepository.findAll();
    return res.map((doc) => doc.toJSON());
  }

  async insert(input: ItemListInput, ctx: RequestContext): Promise<ItemList> {
    if (!ctx.id || !ctx.role) {
      throw new AuthenticationError('Must be authenticated to add itemlist');
    }
    const { itemListInput } = input;
    itemListInput.created = new Date();
    itemListInput.owner = ctx.id;
    const res = await this.itemListRepository.insert(input);
    return res.toJSON();
  }
}
