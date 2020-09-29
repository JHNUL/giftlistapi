import serverConfig from '../src/apollo';
import { ApolloServer } from 'apollo-server';
import {
  createTestClient,
  ApolloServerTestClient,
} from 'apollo-server-testing';
import {
  CREATE_PASSWORD,
  CREATE_USER,
  GET_USER,
  LOGIN,
  ME,
} from './util/graphClient';
import { connectToDb, closeDbConnection } from '../src/mongo';
import { ItemModel } from '../src/models/ItemModel';
import { UserModel } from '../src/models/UserModel';
import { Role, Token } from '../src/graphql/types';
import { createUser } from './util/initialisations';
import { GraphQLFormattedError } from 'graphql';

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

  const server: ApolloServer = new ApolloServer(serverConfig);
  const testClient: ApolloServerTestClient = createTestClient(server);

  it('can add a new user', async () => {
    const { data } = await testClient.mutate({
      mutation: CREATE_USER,
      variables: {
        userInput: { name: 'tester', username: 'tester', role: Role.User },
      },
    });
    // eslint-disable-next-line
    const { id, ...userWithoutId } = data?.addUser;
    expect(userWithoutId).toEqual({
      name: 'tester',
      username: 'tester',
      role: 'USER',
      items: [],
      password: null,
    });
  });

  it('can find user by id', async () => {
    await createUser('user1', 'user1', Role.User);
    const user = await createUser('user2', 'user2', Role.User);
    await createUser('user3', 'user3', Role.User);
    const { data } = await testClient.query({
      query: GET_USER,
      variables: { id: user.id },
    });
    // eslint-disable-next-line
    const { id, ...userWithoutId } = data?.user;
    expect(userWithoutId).toEqual({
      name: 'user2',
      username: 'user2',
      role: 'USER',
      items: [],
      password: null,
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
    await createUser('user1', 'user1', Role.User);
    const user = await createUser('user2', 'user2', Role.User);
    await createUser('user3', 'user3', Role.User);
    const { data } = await testClient.query({
      query: ME,
      variables: { username: user.username },
    });
    // eslint-disable-next-line
    const { id, ...userWithoutId } = data?.me;
    expect(userWithoutId).toEqual({
      name: 'user2',
      username: 'user2',
      role: 'USER',
      items: [],
      password: null,
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
    await createUser('user1', 'user1', Role.User);
    const res = await testClient.mutate({
      mutation: CREATE_USER,
      variables: {
        userInput: { name: 'tester', username: 'user1', role: Role.User },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/^.+ duplicate key error .+$/);
  });

  it('can create a password for user', async () => {
    const user = await createUser('user1', 'user1', Role.User);
    const { data } = await testClient.mutate({
      mutation: CREATE_PASSWORD,
      variables: {
        createPasswordInput: { id: user.id, password: 'oh_woe_is_me' },
      },
    });
    const token = data?.createPassword as Token;
    expect(token.value).toBeDefined();
    expect(token.value).toMatch(/^Bearer .+$/);
  });

  it('cannot create a password for user - user not found', async () => {
    const res = await testClient.mutate({
      mutation: CREATE_PASSWORD,
      variables: {
        createPasswordInput: {
          id: '5f6e2bf0522a6a1967a78311',
          password: 'oh_woe_is_me',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toMatch(/^No user found with id .+$/);
  });

  it('cannot create a password for user - user already has password', async () => {
    const user = await createUser('user1', 'user1', Role.User);
    await testClient.mutate({
      mutation: CREATE_PASSWORD,
      variables: {
        createPasswordInput: { id: user.id, password: 'oh_woe_is_me' },
      },
    });
    const res = await testClient.mutate({
      mutation: CREATE_PASSWORD,
      variables: {
        createPasswordInput: {
          id: user.id,
          password: 'overwrite_password_attempt',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('User already has password');
  });

  it('cannot create a password for user - below min lenght', async () => {
    const user = await createUser('user1', 'user1', Role.User);
    const res = await testClient.mutate({
      mutation: CREATE_PASSWORD,
      variables: { createPasswordInput: { id: user.id, password: 'mini' } },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Password min length is 8 characters');
  });

  it('can login with correct credentials', async () => {
    const user = await createUser('user1', 'user1', Role.User);
    await testClient.mutate({
      mutation: CREATE_PASSWORD,
      variables: {
        createPasswordInput: { id: user.id, password: 'oh_woe_is_me' },
      },
    });
    const { data } = await testClient.mutate({
      mutation: LOGIN,
      variables: {
        loginInput: { username: user.username, password: 'oh_woe_is_me' },
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
    const user = await createUser('user1', 'user1', Role.User);
    await testClient.mutate({
      mutation: CREATE_PASSWORD,
      variables: {
        createPasswordInput: { id: user.id, password: 'oh_woe_is_me' },
      },
    });
    const res = await testClient.mutate({
      mutation: LOGIN,
      variables: {
        loginInput: {
          username: user.username,
          password: 'oops I did it again',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Password not correct');
  });

  it('cannot login - user does not have a password', async () => {
    const user = await createUser('user1', 'user1', Role.User);
    const res = await testClient.mutate({
      mutation: LOGIN,
      variables: {
        loginInput: {
          username: user.username,
          password: 'oops I did it again',
        },
      },
    });
    // eslint-disable-next-line
    const errors = res.errors as GraphQLFormattedError<Record<string, any>>[];
    expect(errors[0].message).toEqual('Password not correct');
  });
});
