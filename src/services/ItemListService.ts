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

  async insert(
    input: ItemListInput,
    ctx: RequestContext
  ): Promise<ItemList | undefined> {
    const userId = ctx.id as string; // already checked
    const { itemListInput } = input;
    itemListInput.created = new Date();
    itemListInput.owner = userId;
    const res = await this.itemListRepository.insert(input);
    const itemList = await this.itemListRepository.findById(res?.toJSON().id);
    const user = await this.userRepository.findById(userId);
    user?.itemLists.push(itemList?._id);
    await user?.save();
    return itemList?.toJSON();
  }
}
