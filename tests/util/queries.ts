import { gql } from 'apollo-server';

export const CREATE_ITEM = gql`
mutation AddItem($itemInput: ItemInput!) {
  addItem(itemInput: $itemInput) {
    id,
    title,
    description,
    url,
    reserved
  }
}`;

export const GET_ITEMS = gql`
{
  allItems {
    id,
    title,
    description,
    url,
    reserved
  }
}
`;
