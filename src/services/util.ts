/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config';
import { Role, Token } from '../graphql/types';

const isObjectId = (arg: unknown): arg is mongoose.Schema.Types.ObjectId => {
  return arg && typeof arg === 'object';
};

export const objectIdsAreEqual = (objectIdA: any, objectIdB: any): boolean => {
  if (isObjectId(objectIdA) && isObjectId(objectIdB)) {
    return objectIdA.toString() === objectIdB.toString();
  }
  return false;
};

export const createToken = (
  username: string,
  id: string,
  role: Role
): Token => {
  const takenToken = jwt.sign({ username, id, role }, config.secret, {
    expiresIn: config.tokenExpiry,
  });
  return {
    value: `Bearer ${takenToken}`,
  };
};
