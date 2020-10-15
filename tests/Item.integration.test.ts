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
  GET_ITEMS,
  GET_ITEM,
  RELEASE_ITEM,
  REMOVE_ITEM,
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

  it('Can delete an item with a targeted itemlist', async () => {
    const item = await createItem('myItem', false, 'some description');
    const itemList = await createItemList(
      'myItemList',
      'hash1234',
      testUser.id,
      [item]
    );
    const { data } = await testClient.mutate({
      mutation: REMOVE_ITEM,
      variables: { removeItemInput: { listId: itemList.id, itemId: item.id } },
    });
    expect(data?.removeItem).toBeTruthy();
    const { data: itemData } = await testClient.query({
      query: GET_ITEM,
      variables: { id: item.id }
    })
    expect(itemData?.item).toBeNull()
  });

  it('Cannot delete an item if it does not belong to the itemlist', async () => {
    const item = await createItem('myItem', false, 'some description');
    await createItemList('myItemList', 'hash1234', testUser.id, [item]);
    const itemList2 = await createItemList(
      'myItemList2',
      'hash12346',
      testUser.id,
      []
    );
    const res = await testClient.mutate({
      mutation: REMOVE_ITEM,
      variables: { removeItemInput: { listId: itemList2.id, itemId: item.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Item not found in itemlist/);
  });

  it('Cannot delete an item if itemlist not found', async () => {
    const item = await createItem('myItem', false, 'some description');
    await createItemList('myItemList', 'hash1234', testUser.id, [item]);
    const res = await testClient.mutate({
      mutation: REMOVE_ITEM,
      variables: {
        removeItemInput: {
          listId: '5f6e2bf0522a6a1967a78311',
          itemId: item.id,
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Itemlist not found/);
  });

  it('Cannot delete an item if itemlist does not belong to the user', async () => {
    const newUser = await createUser(
      'newUser',
      'newUsername',
      Role.TestUser,
      'zekkrett'
    );
    const item = await createItem('myItem', false, 'some description');
    const itemList = await createItemList(
      'myItemList',
      'hash1234',
      newUser.id,
      [item]
    );
    const res = await testClient.mutate({
      mutation: REMOVE_ITEM,
      variables: { removeItemInput: { listId: itemList.id, itemId: item.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Only list owner can remove an item/);
  });

  it("Can reserve an unreserved item if user is connected to the item's itemList", async () => {
    const item = await createItem('newItem', false);
    const list = await createItemList('newItemList', 'foooo', testUser.id, [
      item,
    ]);
    const { data } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { listId: list.id, itemId: item.id } },
    });
    expect(data?.reserveItem).toBeTruthy();
  });

  it("Cannot reserve an unreserved item if user is not connected to the item's itemList", async () => {
    const newUser = await createUser(
      'newUser',
      'newUsername',
      Role.TestUser,
      'zekkrett'
    );
    const item = await createItem('newItem', false);
    const newItemList = await createItemList(
      'newItemList',
      'qwetry1234',
      newUser.id,
      [item]
    );
    const res = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: {
        reserveItemInput: { listId: newItemList.id, itemId: item.id },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(
      /User does not have access to item's list/
    );
  });

  it('Cannot reserve a reserved item', async () => {
    const item = await createItem('newItem', true);
    const list = await createItemList('newItemList', 'foooo', testUser.id, [
      item,
    ]);
    const res = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { listId: list.id, itemId: item.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Item is already reserved');
  });

  it('Cannot reserve an unreserved item if user is not authenticated', async () => {
    const newserver: ApolloServer = new ApolloServer(getServerConfig({}));
    const newtestClient = createTestClient(newserver);
    const item = await createItem('newItem', false);
    const list = await createItemList('newItemList', 'foooo', testUser.id, [
      item,
    ]);
    const res = await newtestClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { listId: list.id, itemId: item.id } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/User must be authenticated/);
  });

  it('cannot reserve non-existing item', async () => {
    const item = await createItem('newItem', false);
    const newItemList = await createItemList(
      'newItemList',
      'qwetry1234',
      testUser.id,
      [item]
    );
    const res = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: {
        reserveItemInput: {
          listId: newItemList.id,
          itemId: '5f6e2bf0522a6a1967a78311',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Item does not exist/);
  });

  it('Can release a reserved item', async () => {
    const item = await createItem('newItem', false);
    const list = await createItemList('newItemList', 'foooo', testUser.id, [
      item,
    ]);
    const { data } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { listId: list.id, itemId: item.id } },
    });
    expect(data?.reserveItem).toBeTruthy();
    const { data: releaseData } = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: { releaseItemInput: { listId: list.id, itemId: item.id } },
    });
    expect(releaseData?.releaseItem).toBe(true);
  });

  it('Cannot release item that does not exist', async () => {
    const item = await createItem('newItem', false);
    const list = await createItemList('newItemList', 'foooo', testUser.id, [
      item,
    ]);
    const { data } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { listId: list.id, itemId: item.id } },
    });
    expect(data?.reserveItem).toBeTruthy();
    const res = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: {
        releaseItemInput: {
          listId: list.id,
          itemId: '5f6e2bf0522a6a1967a78311',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Item does not exist/);
  });

  it('Cannot release item if itemlist does not exist', async () => {
    const item = await createItem('newItem', false);
    const list = await createItemList('newItemList', 'foooo', testUser.id, [
      item,
    ]);
    const { data } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { listId: list.id, itemId: item.id } },
    });
    expect(data?.reserveItem).toBeTruthy();
    const res = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: {
        releaseItemInput: {
          listId: '5f6e2bf0522a6a1967a78311',
          itemId: item.id,
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/ItemList does not exist/);
  });

  it('Cannot release item if item not found in itemlist', async () => {
    const item = await createItem('newItem', true);
    const list = await createItemList('newItemList', 'foooo', testUser.id);
    const res = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: {
        releaseItemInput: {
          listId: list.id,
          itemId: item.id,
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Item not found in itemlist/);
  });

  it('Cannot release item if user does not have access to itemlist', async () => {
    const newUser = await createUser(
      'dsflksdjf',
      'ladsöfaksdjf',
      Role.TestUser,
      'asldkfjlöasdfjk'
    );
    const item = await createItem('newItem', true);
    const list = await createItemList('newItemList', 'foooo', newUser.id, [
      item,
    ]);
    const res = await testClient.mutate({
      mutation: RELEASE_ITEM,
      variables: {
        releaseItemInput: {
          listId: list.id,
          itemId: item.id,
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(
      /User does not have access to item's list/
    );
  });

  it('Cannot release item if item has not been reserved by user', async () => {
    // testUser adds item to the list
    const { data: itemData } = await testClient.mutate({
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
    expect(itemData?.addItem).toBeTruthy();
    // create new user
    const newUser = await createUser(
      'bilbo',
      'bagginses',
      Role.TestUser,
      'asldkfjlöasdfjk',
      [],
      [itemList]
    );
    const newToken = createToken('bagginses', newUser.id, newUser.role);
    const newTestHeaders = { authorization: `${newToken.value}` };
    const newServer: ApolloServer = new ApolloServer(
      getServerConfig(newTestHeaders)
    );
    const newTestClient = createTestClient(newServer);
    const res = await newTestClient.mutate({
      mutation: RELEASE_ITEM,
      variables: {
        releaseItemInput: {
          listId: itemList.id,
          itemId: itemData?.addItem.id, // eslint-disable-line
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/User has not reserved this item/);
  });
});
