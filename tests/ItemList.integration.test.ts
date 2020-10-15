import { ApolloServer } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import { GraphQLFormattedError } from 'graphql';
import getServerConfig from '../src/apollo';
import { Role, User } from '../src/graphql/types';
import { ItemListModel } from '../src/models/ItemList';
import { ItemModel } from '../src/models/Item';
import { UserModel } from '../src/models/User';
import { closeDbConnection, connectToDb } from '../src/mongo';
import { createToken } from '../src/services/util';
import { CREATE_ITEMLIST, GET_ITEMLIST, REMOVE_ITEMLIST } from './util/client';
import { createItemList, createUser } from './util/seedUtil';

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

  it('Can fetch an itemlist', async () => {
    const itemList = await createItemList(
      'testItemlist',
      'hash1234',
      testUser.id
    );
    const { data } = await testClient.query({
      query: GET_ITEMLIST,
      variables: { id: itemList.id },
    });
    expect(data?.itemList).toEqual({
      id: itemList.id,
      name: 'testItemlist',
      owner: { name: 'testUser' },
      items: [],
    });
  });

  it('Cannot remove an itemlist if user is unauthorized', async () => {
    const newserver: ApolloServer = new ApolloServer(getServerConfig({}));
    const newtestClient = createTestClient(newserver);
    const itemList = await createItemList(
      'testItemlist',
      'hash1234',
      testUser.id
    );
    const res = await newtestClient.mutate({
      mutation: REMOVE_ITEMLIST,
      variables: { removeItemListInput: { listId: itemList.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/User must be authenticated/);
  });

  it('Cannot remove an itemlist if user is not the owner', async () => {
    const newuser = await createUser(
      'fooUser',
      'fooUsername',
      Role.TestUser,
      'passssword1_'
    );
    const itemList = await createItemList(
      'testItemlist',
      'hash1234',
      newuser.id
    );
    const res = await testClient.mutate({
      mutation: REMOVE_ITEMLIST,
      variables: { removeItemListInput: { listId: itemList.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Only owner can delete itemlist/);
  });

  it('Itemlist not found', async () => {
    const res = await testClient.mutate({
      mutation: REMOVE_ITEMLIST,
      variables: {
        removeItemListInput: { listId: '5f6e2bf0522a6a1967a78311' },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Itemlist not found/);
  });

  it('Can remove an itemlist', async () => {
    const itemList = await createItemList(
      'testItemlist',
      'hash1234',
      testUser.id
    );
    const { data } = await testClient.mutate({
      mutation: REMOVE_ITEMLIST,
      variables: { removeItemListInput: { listId: itemList.id } },
    });
    expect(data?.removeItemList).toBeTruthy();
    const { data: fetchData } = await testClient.query({
      query: GET_ITEMLIST,
      variables: { id: itemList.id },
    });
    expect(fetchData?.itemList).toBeNull();
  });
});
