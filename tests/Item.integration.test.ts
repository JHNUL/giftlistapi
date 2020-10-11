import { ApolloServer } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import { GraphQLFormattedError } from 'graphql';
import getServerConfig from '../src/apollo';
import { Item, ItemList, Role, User } from '../src/graphql/types';
import { ItemModel } from '../src/models/Item';
import { ItemListModel } from '../src/models/ItemList';
import { UserModel } from '../src/models/User';
import { closeDbConnection, connectToDb } from '../src/mongo';
import { createToken } from '../src/services/util';
import {
  CREATE_ITEM,
  GET_ITEM,
  GET_ITEMS,
  RELEASE_ITEM,
  RESERVE_ITEM,
} from './util/client';
import { createItem, createItemList, createUser } from './util/seedUtil';

describe('Item integration tests', () => {
  let testClient: ApolloServerTestClient;
  let testUser: User;
  let itemList: ItemList;
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
    itemList = await createItemList('testItemList', 'hash1234', testUser.id);
    const token = createToken('testUserName', testUser.id, testUser.role);
    const testHeaders = { authorization: `${token.value}` };
    const server: ApolloServer = new ApolloServer(getServerConfig(testHeaders));
    testClient = createTestClient(server);
  });

  it('Can add a new item with targeted itemList', async () => {
    await testClient.mutate({
      mutation: CREATE_ITEM,
      variables: {
        itemInput: {
          title: 'foo',
          description: 'fooer',
          url: 'bar',
          listId: itemList.id,
        },
      },
    });
    const { data } = await testClient.query({ query: GET_ITEMS });
    const items = data?.allItems as [Item];
    expect(items.length).toBe(1);
    // eslint-disable-next-line
    const { id, ...itemWithoutId } = items[0];
    expect(itemWithoutId).toEqual({
      title: 'foo',
      description: 'fooer',
      url: 'bar',
      reserved: false,
    });
    const updatedItemList = await ItemListModel.findById(itemList.id);
    expect(updatedItemList?.items[0].toString()).toEqual(id);
  });

  it('Cannot add a new item without targeted itemList', async () => {
    const res = await testClient.mutate({
      mutation: CREATE_ITEM,
      variables: {
        itemInput: { title: 'foo', description: 'fooer', url: 'bar' },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(
      /Field "listId" of required type "ID!" was not provided./
    );
  });

  it('Cannot add a new item if user does not own itemList', async () => {
    const newUser = await createUser(
      'duuud',
      'duuuder',
      Role.TestUser,
      'zzekret1'
    );
    const newItemList = await createItemList(
      'huzzaaah',
      'hash123434',
      newUser.id
    );
    const res = await testClient.mutate({
      mutation: CREATE_ITEM,
      variables: {
        itemInput: {
          title: 'foo',
          description: 'fooer',
          url: 'bar',
          listId: newItemList.id,
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Only owner can add item to list/);
  });

  it("Can reserve an unreserved item if user is connected to the item's itemList", async () => {
    const item = await createItem('newItem', false);
    await createItemList('newItemList', 'foooo', testUser.id, [item]);
    const { data } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { userId: testUser.id, itemId: item.id } },
    });
    expect(data?.reserveItem).toBeTruthy();
  });

  it.only("Cannot reserve an unreserved item if user is not connected to the item's itemList", async () => {
    const newUser = await createUser(
      'newUser',
      'newUsername',
      Role.TestUser,
      'zekkrett'
    );
    const item = await createItem('newItem', false);
    const newItemList = await createItemList('newItemList', 'qwetry1234', newUser.id, [item])
    const res = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { listId: newItemList.id, itemId: item.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/User does not have access to item's list/);
  });

  it('Cannot reserve a reserved item', async () => {
    const item = await createItem('newItem', true);
    await createItemList('newItemList', 'foooo', testUser.id, [item]);
    const res = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { userId: testUser.id, itemId: item.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Item is already reserved');
  });

  it('cannot reserve item with a non-existing user', async () => {
    const item = await createItem('item', false, 'dididi', 'url');
    const res = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: {
        reserveItemInput: {
          userId: '5f6e2bf0522a6a1967a78311',
          itemId: item.id,
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Item or user does not exist');
  });

  it('cannot reserve non-existing item', async () => {
    const user = await createUser(
      'tester',
      'tester',
      Role.User,
      'testerer',
      []
    );
    const res = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: {
        reserveItemInput: {
          userId: user.id,
          itemId: '5f6e2bf0522a6a1967a78311',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Item or user does not exist');
  });

  it('cannot reserve a reserved item', async () => {
    const item = await createItem('item', false, 'dididi', 'url');
    const user = await createUser(
      'tester',
      'tester',
      Role.User,
      'testerer',
      []
    );
    await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { userId: user.id, itemId: item.id } },
    });
    const res = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { userId: user.id, itemId: item.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Item is already reserved');
  });

  it('can release a reserved item', async () => {
    const item = await createItem('item', false, 'dididi', 'url');
    const user = await createUser(
      'tester',
      'tester',
      Role.User,
      'testerer',
      []
    );
    const { data } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { userId: user.id, itemId: item.id } },
    });
    expect(data?.reserveItem).toBe(true);
    const { data: releaseData } = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: { releaseItemInput: { userId: user.id, itemId: item.id } },
    });
    expect(releaseData?.releaseItem).toBe(true);
  });

  it('cannot release a reserved item - does not belong to user', async () => {
    const item = await createItem('item', false, 'dididi', 'url');
    const user = await createUser(
      'tester',
      'tester',
      Role.User,
      'testerer',
      []
    );
    const user2 = await createUser(
      'tester2',
      'tester2',
      Role.User,
      'testerer2',
      []
    );
    const { data } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { userId: user.id, itemId: item.id } },
    });
    expect(data?.reserveItem).toBe(true);
    const res = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: { releaseItemInput: { userId: user2.id, itemId: item.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/^User does not have item .+ reserved$/);
  });

  it('cannot release a reserved item - item does not exist', async () => {
    const user = await createUser(
      'tester',
      'tester',
      Role.User,
      'testerer',
      []
    );
    const res = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: {
        releaseItemInput: {
          userId: user.id,
          itemId: '5f6e2bf0522a6a1967a78311',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Item or user does not exist');
  });

  it('cannot release a reserved item - user does not exist', async () => {
    const item = await createItem('item', false, 'dididi', 'url');
    const user = await createUser(
      'tester',
      'tester',
      Role.User,
      'testerer',
      []
    );
    const { data } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { userId: user.id, itemId: item.id } },
    });
    expect(data?.reserveItem).toBe(true);
    const res = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: {
        releaseItemInput: {
          userId: '5f6e2bf0522a6a1967a78311',
          itemId: item.id,
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Item or user does not exist');
  });

  it('can find an item by id', async () => {
    await createItem('item1', false);
    const { id } = await createItem('item2', false);
    await createItem('item3', false);
    const { data } = await testClient.query({
      query: GET_ITEM,
      variables: { id },
    });
    const item = data?.item as Item;
    expect(item.title).toEqual('item2');
  });
});
