import { ApolloServer } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import { GraphQLFormattedError } from 'graphql';
import getServerConfig from '../src/apollo';
import { Role, Token } from '../src/graphql/types';
import { ItemModel } from '../src/models/Item';
import { UserModel } from '../src/models/User';
import { closeDbConnection, connectToDb } from '../src/mongo';
import { CREATE_USER, GET_USER, LOGIN, ME } from './util/client';
import { createUser } from './util/seedUtil';

describe('User integration tests', () => {
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

  const testHeaders = { from: 'test' };
  const server: ApolloServer = new ApolloServer(getServerConfig(testHeaders));
  const testClient: ApolloServerTestClient = createTestClient(server);

  it('can add a new user', async () => {
    const { data } = await testClient.mutate({
      mutation: CREATE_USER,
      variables: {
        userInput: {
          name: 'tester',
          username: 'tester',
          role: Role.User,
          password: 'foofofoo',
        },
      },
    });
    // eslint-disable-next-line
    const { id, password, ...userWithoutIdOrPassword } = data?.addUser;
    expect(typeof id === 'string').toBeTruthy();
    expect(typeof password === 'string').toBeTruthy();
    expect(userWithoutIdOrPassword).toEqual({
      name: 'tester',
      username: 'tester',
      role: 'USER',
      items: [],
    });
  });

  it('cannot add a new user - password too short', async () => {
    const res = await testClient.mutate({
      mutation: CREATE_USER,
      variables: {
        userInput: {
          name: 'tester',
          username: 'tester',
          role: Role.User,
          password: 'foo',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/Password min length is 8 characters/);
  });

  it('can find user by id', async () => {
    await createUser('user1', 'user1', Role.User, '12345678');
    const user = await createUser('user2', 'user2', Role.User, '12345678');
    await createUser('user3', 'user3', Role.User, '12345678');
    const { data } = await testClient.query({
      query: GET_USER,
      variables: { id: user.id },
    });
    // eslint-disable-next-line
    const { id, password, ...userWithoutIdOrPassword } = data?.user;
    expect(userWithoutIdOrPassword).toEqual({
      name: 'user2',
      username: 'user2',
      role: 'USER',
      items: [],
    });
  });

  it('cannot find user by id', async () => {
    const { data } = await testClient.query({
      query: GET_USER,
      variables: { id: '5f6e2bf0522a6a1967a78311' },
    });
    expect(data?.user).toBeNull();
  });

  it('can find user by name', async () => {
    await createUser('user1', 'user1', Role.User, '12345678');
    const user = await createUser('user2', 'user2', Role.User, '12345678');
    await createUser('user3', 'user3', Role.User, '12345678');
    const { data } = await testClient.query({
      query: ME,
      variables: { username: user.username },
    });
    // eslint-disable-next-line
    const { id, password, ...userWithoutIdOrPassword } = data?.me;
    expect(userWithoutIdOrPassword).toEqual({
      name: 'user2',
      username: 'user2',
      role: 'USER',
      items: [],
    });
  });

  it('cannot find user by name', async () => {
    const { data } = await testClient.query({
      query: ME,
      variables: { username: '___qwerty143123414' },
    });
    expect(data?.me).toBeNull();
  });

  it('cannot create user with existing username', async () => {
    await createUser('user1', 'user1', Role.User, '12345678');
    const res = await testClient.mutate({
      mutation: CREATE_USER,
      variables: {
        userInput: {
          name: 'tester',
          username: 'user1',
          role: Role.User,
          password: '12345678',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/^.+ duplicate key error .+$/);
  });

  it('can login with correct credentials', async () => {
    await testClient.mutate({
      mutation: CREATE_USER,
      variables: {
        userInput: {
          name: 'tester',
          username: 'tester',
          role: Role.User,
          password: 'foofofoo',
        },
      },
    });
    const { data } = await testClient.mutate({
      mutation: LOGIN,
      variables: {
        loginInput: { username: 'tester', password: 'foofofoo' },
      },
    });
    const token = data?.login as Token;
    expect(token.value).toBeDefined();
    expect(token.value).toMatch(/^Bearer .+$/);
  });

  it('cannot login - no user found with username', async () => {
    const res = await testClient.mutate({
      mutation: LOGIN,
      variables: {
        loginInput: {
          username: 'baby jesus',
          password: 'a pint and another one',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('No user found with username baby jesus');
  });

  it('cannot login - incorrect password', async () => {
    await testClient.mutate({
      mutation: CREATE_USER,
      variables: {
        userInput: {
          name: 'tester',
          username: 'tester',
          role: Role.User,
          password: 'foofofoo',
        },
      },
    });
    const res = await testClient.mutate({
      mutation: LOGIN,
      variables: {
        loginInput: {
          username: 'tester',
          password: 'oops I did it again',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Password not correct');
  });
});
