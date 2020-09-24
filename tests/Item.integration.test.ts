import serverConfig from '../src/apollo';
import { ApolloServer } from 'apollo-server';
import { createTestClient, ApolloServerTestClient } from 'apollo-server-testing';
import { CREATE_ITEM, GET_ITEMS } from './util/queries';
import { connectToDb, closeDbConnection } from '../src/mongo';
import { ItemModel } from '../src/models/ItemModel';
import { UserModel } from '../src/models/UserModel';
import { Item } from '../src/graphql/types';

describe('Item integration tests', () => {

  beforeAll(async () => {
    await connectToDb();
    // TODO: add handling for when connection fails
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
      variables: { itemInput: { title: 'foo', description: 'fooer', url: 'bar' } }
    });
    const { data } = await testClient.query({ query: GET_ITEMS });
    const items = data?.allItems as [Item];
    expect(items.length).toBe(1);
    // eslint-disable-next-line
    const { id, ...rest } = items[0];
    expect(rest).toEqual({
      title: 'foo',
      description: 'fooer',
      url: 'bar',
      reserved: false
    });
  });

});
