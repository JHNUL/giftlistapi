/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import mongoose from 'mongoose';

const isObjectId = (arg: unknown): arg is mongoose.Schema.Types.ObjectId => {
  return arg && typeof arg === 'object';
};

export const objectIdsAreEqual = (
  objectIdA: any,
  objectIdB: any
): boolean => {
  if (isObjectId(objectIdA) && isObjectId(objectIdB)) {
    return objectIdA.toString() === objectIdB.toString();
  }
  return false;
};
