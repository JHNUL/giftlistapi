import { Field, ID, ObjectType } from 'type-graphql';
import { User } from './userType';

@ObjectType({ description: 'An object representing a giftlist item' })
export class Item {
  @Field(_type => ID)
  id!: string;

  @Field()
  title!: string;

  @Field(_type => User, { nullable: true })
  reservedBy!: User;

  @Field({ nullable: true })
  description!: string;

  @Field({ nullable: true })
  url!: string;
}
