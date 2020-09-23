import { v4 as idGen } from 'uuid';
import { Item, ItemInput, UserInput } from '../../graphql/types';
import { IItemModel, ItemModel } from '../../models/ItemModel';
import { IUserModel, UserModel } from '../../models/UserModel';
import { ItemRepository } from '../../repositories/ItemRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { ItemService } from '../ItemService';

type PublicInterfaceOf<Class> = {
  [Member in keyof Class]: Class[Member];
};

interface InstanceProperties {
  title: string
  reserved: boolean
  description: string
  url: string
  id: string
  [key: string]: string | boolean | Item
}

class MockItemModel extends ItemModel {

  private instanceProperties: InstanceProperties;

  constructor({ title, reserved, description, url, id, toJSON }: InstanceProperties) {
    super();
    this.instanceProperties = {
      title, reserved, description, url, id, toJSON
    };
  }

  public get(path: string): string | boolean | Item {
    if (path === 'toJSON') {
      return { ...this.instanceProperties };
    }
    return this.instanceProperties[path];
  }

}

class MockItemRepository implements PublicInterfaceOf<ItemRepository> {

  constructor(private itemModels: Array<MockItemModel>) { }

  async findAll(): Promise<IItemModel[]> {
    return await Promise.resolve(this.itemModels);
  }

  async findById(id: string): Promise<IItemModel | null> {
    const model = this.itemModels.find(mod => mod.toJSON().id === id);
    return await Promise.resolve(model ?? null);
  }

  async insert(input: ItemInput): Promise<IItemModel> {
    const modelInput = {
      id: idGen(),
      title: input.itemInput.title,
      description: input.itemInput.description || 'itemDescription',
      url: input.itemInput.url || 'itemUrl',
      reserved: false
    };
    const newModel = new MockItemModel(modelInput);
    this.itemModels.push(newModel);
    return await Promise.resolve(newModel);
  }

}

class MockUserRepository implements PublicInterfaceOf<UserRepository> {

  // constructor(private userModels: Array<IUserModel>) { }

  async findById(id: string): Promise<IUserModel | null> {
    return await Promise.resolve(new UserModel());
  }

  async findAll(): Promise<IUserModel[]> {
    return await Promise.resolve([new UserModel()]);
  }

  async findByUsername(username: string): Promise<IUserModel | null> {
    return await Promise.resolve(new UserModel());
  }

  async insert(input: UserInput): Promise<IUserModel> {
    return await Promise.resolve(new UserModel());
  }

}

describe('ItemService', () => {

  it('findById returns found object', async () => {
    const props: InstanceProperties = {
      id: 'foo',
      title: 'fooTitle',
      description: 'fooDescription',
      url: 'fooUrl',
      reserved: false
    };
    const mockItem1 = new MockItemModel(props);
    const itemService = new ItemService(new MockItemRepository([mockItem1]), new MockUserRepository());
    const res = await itemService.findById('foo');
    expect(res?.id).toBe('foo');
  });

  it('findById returns undefined when object not found', async () => {
    const props: InstanceProperties = {
      id: 'foo',
      title: 'fooTitle',
      description: 'fooDescription',
      url: 'fooUrl',
      reserved: false
    };
    const mockItem1 = new MockItemModel(props);
    const itemService = new ItemService(new MockItemRepository([mockItem1]), new MockUserRepository());
    const res = await itemService.findById('nil');
    expect(res).toBeUndefined();
  });

});
