import { registerEnumType } from 'type-graphql';

export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
  TestUser = 'TESTUSER'
}

registerEnumType(Role, {
  name: 'Role'
});
