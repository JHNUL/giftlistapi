import { Field, ObjectType, ID, registerEnumType, InputType } from 'type-graphql';
import { Item } from './itemType';
import { Role } from './role.enum';

registerEnumType(Role, {
  name: 'Role'
});

@ObjectType({ description: 'Object representing a user' })
export class User {
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

  @Field(_type => [Item])
  items!: Item[];
}

@InputType()
export class UserInput {
  @Field()
  name!: string;

  @Field()
  username!: string;

  @Field()
  password!: string;

  @Field(_type => Role)
  role!: Role;

  @Field(_type => [Item])
  items!: Item[];
}
