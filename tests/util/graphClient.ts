import { gql } from 'apollo-server';

export const CREATE_ITEM = gql`
  mutation AddItem($itemInput: ItemInput!) {
    addItem(itemInput: $itemInput) {
      id
      title
      description
      url
      reserved
    }
  }
`;

export const CREATE_USER = gql`
  mutation AddUser($userInput: UserInput!) {
    addUser(userInput: $userInput) {
      name
      username
      id
      role
      items {
        title
      }
      password
    }
  }
`;

export const GET_ITEMS = gql`
  {
    allItems {
      id
      title
      description
      url
      reserved
    }
  }
`;

export const GET_ITEM = gql`
  query Item($id: ID!) {
    item(id: $id) {
      id
      title
      description
      url
      reserved
    }
  }
`;

export const RESERVE_ITEM = gql`
  mutation ReserveItem($reserveItemInput: ReserveItemInput!) {
    reserveItem(reserveItemInput: $reserveItemInput)
  }
`;

export const RELEASE_ITEM = gql`
  mutation ReleaseItem($releaseItemInput: ReleaseItemInput!) {
    releaseItem(releaseItemInput: $releaseItemInput)
  }
`;

export const GET_USER = gql`
  query User($id: ID!) {
    user(id: $id) {
      name
      username
      id
      role
      items {
        title
      }
      password
    }
  }
`;

export const ME = gql`
  query Me($username: String!) {
    me(username: $username) {
      name
      username
      id
      role
      items {
        title
      }
      password
    }
  }
`;

export const CREATE_PASSWORD = gql`
  mutation CreatePassword($createPasswordInput: CreatePasswordInput!) {
    createPassword(createPasswordInput: $createPasswordInput) {
      value
    }
  }
`;

export const LOGIN = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      value
    }
  }
`;
