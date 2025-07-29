import { Pool } from 'pg';

export abstract class BaseMapper<T> {
  constructor(protected pool: Pool) {}

  abstract save(entity: T): Promise<void>;
  abstract getById(id: string): Promise<T | null>;
  abstract getAll(): Promise<T[]>;
  abstract delete(id: string): Promise<void>;
}
