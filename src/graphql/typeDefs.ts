import { gql } from 'apollo-server';
import { Arg, Field, ID, InputType, Mutation, ObjectType, Query, registerEnumType, Resolver } from 'type-graphql';
import { ItemService } from '../services/index';
import { Role } from './types';

registerEnumType(Role, {
  name: 'Role'
});

@ObjectType()
class User {
  @Field(_type => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  username!: string;

  @Field()
  password!: string;

  @Field(_type => Role)
  role!: Role;

  @Field({ nullable: true })
  items!: Item[];
}

@InputType()
class UserInput {
  @Field(_type => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  username!: string;

  @Field()
  password!: string;

  @Field(_type => Role)
  role!: Role;

}

@ObjectType()
class Item {
  @Field(_type => ID)
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  reservedBy!: User;

  @Field({ nullable: true })
  description!: string;

  @Field({ nullable: true })
  url!: string;
}

@ObjectType()
class Token {
  @Field(_type => Role)
  role!: Role;

  @Field()
  name!: string;

  @Field()
  value!: string;
}

@InputType()
class EditUserInput {
  @Field(_type => ID)
  id!: string;

  @Field({ nullable: true })
  name!: string;

  @Field({ nullable: true })
  username!: string;

  @Field(_type => Role, { nullable: true })
  role!: Role;

  @Field({ nullable: true })
  password!: string;
}

@InputType()
class EditItemInput {
  @Field(_type => ID)
  id!: string;

  @Field({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  reservedBy!: UserInput;

  @Field({ nullable: true })
  description!: string;

  @Field({ nullable: true })
  url!: string;
}

@InputType()
class AddItemInput {

  @Field()
  title!: string;

  @Field({ nullable: true })
  description!: string;

  @Field({ nullable: true })
  url!: string;
}

@Resolver(Item)
class ItemResolver {
  constructor(private itemService: ItemService) { }

  @Query(_returns => [Item])
  async allItems(@Arg('reserved', { nullable: true }) reserved = false) {
    return await this.itemService.findAll(reserved);
  }

  @Query(_returns => Item, { nullable: true })
  async item(@Arg('id') id: string) {
    return await this.itemService.findById(id);
  }

  @Mutation(_returns => Item)
  async addItem(@Arg('itemInput') itemInput: AddItemInput) {
    return await this.itemService.createItem(itemInput);
  }

  @Mutation(_returns => Item, { nullable: true })
  async editItem(@Arg('itemInput') itemInput: EditItemInput) {
    return await this.itemService.editItem(itemInput);
  }

  @Mutation(_returns => Boolean)
  async deleteItem(@Arg('id') id: string) {
    return await this.itemService.deleteById(id);
  }

}

export const typeDefs = gql`
type Query {
  allUsers(role: Role): [User!]!
  user(id: ID!): User
}
type Mutation {
  addUser(name: String!, username: String!, role: Role!, password: String!): User
  editUser(userInput: EditUserInput): User
  login(username: String!, password: String!): Token!
  deleteUser(id: ID!): Boolean!
}`;
