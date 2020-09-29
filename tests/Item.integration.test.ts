import serverConfig from '../src/apollo';
import { ApolloServer } from 'apollo-server';
import {
  createTestClient,
  ApolloServerTestClient,
} from 'apollo-server-testing';
import {
  CREATE_ITEM,
  GET_ITEMS,
  RESERVE_ITEM,
  RELEASE_ITEM,
  GET_ITEM,
} from './util/graphClient';
import { connectToDb, closeDbConnection } from '../src/mongo';
import { ItemModel } from '../src/models/ItemModel';
import { UserModel } from '../src/models/UserModel';
import { Item, Role } from '../src/graphql/types';
import { createItem, createUser } from './util/initialisations';
import { GraphQLFormattedError } from 'graphql';

describe('Item integration tests', () => {
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
  });

  const server: ApolloServer = new ApolloServer(serverConfig);
  const testClient: ApolloServerTestClient = createTestClient(server);

  it('can add a new item', async () => {
    await testClient.mutate({
      mutation: CREATE_ITEM,
      variables: {
        itemInput: { title: 'foo', description: 'fooer', url: 'bar' },
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
  });

  it('can reserve an unreserved item', async () => {
    const { data } = await testClient.mutate({
      mutation: CREATE_ITEM,
      variables: {
        itemInput: { title: 'foo', description: 'fooer', url: 'bar' },
      },
    });
    const item = data?.addItem as Item;
    const user = await createUser('tester', 'tester', Role.User, 'tester', []);
    const { data: reserveItemData } = await testClient.mutate({
      mutation: RESERVE_ITEM,
      variables: { reserveItemInput: { userId: user.id, itemId: item.id } },
    });
    expect(reserveItemData?.reserveItem).toBe(true);
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
    const user = await createUser('tester', 'tester', Role.User, 'tester', []);
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
    const user = await createUser('tester', 'tester', Role.User, 'tester', []);
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
    const user = await createUser('tester', 'tester', Role.User, 'tester', []);
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
    const user = await createUser('tester', 'tester', Role.User, 'tester', []);
    const user2 = await createUser(
      'tester2',
      'tester2',
      Role.User,
      'tester2',
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
    const user = await createUser('tester', 'tester', Role.User, 'tester', []);
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
    const user = await createUser('tester', 'tester', Role.User, 'tester', []);
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
