export interface BaseService<T> {
  findById: (id: string, populate?: boolean) => Promise<T | undefined>;
  findAll: (populate?: boolean) => Promise<T[]>;
}
