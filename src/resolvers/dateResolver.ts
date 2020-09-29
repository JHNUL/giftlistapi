import { GraphQLScalarType } from 'graphql';
import { Kind, ValueNode } from 'graphql/language';

export const DateResolver = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value: string | number) => new Date(value),
    serialize: (value: Date) => value.getTime(),
    parseLiteral: (ast: ValueNode) => {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      }
      return null;
    },
  }),
};
