import { ApolloServer } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import mongoose from 'mongoose';
import getServerConfig from '../src/apollo';
import { Role, User } from '../src/graphql/types';
import { ItemListModel } from '../src/models/ItemList';
import { ItemModel } from '../src/models/Item';
import { UserModel } from '../src/models/User';
import { closeDbConnection, connectToDb } from '../src/mongo';
import { createToken } from '../src/services/util';
import { CREATE_ITEMLIST, ADD_ITEM_TO_LIST } from './util/client';
import { createItem, createItemList, createUser } from './util/seedUtil';

describe('ItemList integration tests', () => {
  let testClient: ApolloServerTestClient;
  let testUser: User;
  beforeAll(async () => {
    try {
      await connectToDb();
    } catch (error) {
      // thrown errors get swallowed, invoke exit explicitly
      // so tests don't start running when DB connection has failed
      process.exit(2);
    }
  });

  afterAll(async () => {
    await closeDbConnection();
  });

  beforeEach(async () => {
    await ItemModel.deleteMany({});
    await UserModel.deleteMany({});
    await ItemListModel.deleteMany({});
    testUser = await createUser(
      'testUser',
      'testUserName',
      Role.TestUser,
      'password1234'
    );
    const token = createToken('testUserName', testUser.id, testUser.role);
    const testHeaders = { authorization: `${token.value}` };
    const server: ApolloServer = new ApolloServer(getServerConfig(testHeaders));
    testClient = createTestClient(server);
  });

  it('Can add a new itemlist', async () => {
    const { data } = await testClient.mutate({
      mutation: CREATE_ITEMLIST,
      variables: {
        itemListInput: {
          name: 'testItemList',
          identifier: 'hash1234',
          owner: testUser.id,
        },
      },
    });
    // eslint-disable-next-line
    const { created, id, ...itemListWithoutCreatedOrId } = data?.addItemList;
    expect(typeof created === 'number').toBe(true);
    expect(itemListWithoutCreatedOrId).toEqual({
      name: 'testItemList',
      identifier: 'hash1234',
      owner: {
        id: testUser.id,
        name: testUser.name,
        username: testUser.username,
      },
      items: [],
    });
    const user = await UserModel.findById(testUser.id);
    expect(user?.itemLists).toHaveLength(1);
    expect(user?.itemLists[0].toString()).toEqual(id);
  });

  it.only('Can add an item to itemlist', async () => {
    const itemList = await createItemList(
      'testItemList',
      'hash1234',
      testUser.id
    );
    const item = await createItem(
      'testItem',
      false,
      'testDescription',
      'testUrl'
    );
    const res = await testClient.mutate({
      mutation: ADD_ITEM_TO_LIST,
      variables: {
        itemToListInput: {
          id: itemList.id,
          itemId: item.id,
        },
      },
    });
    console.log('ItemList.integration.test.ts: res >> ', res);
  });
});
