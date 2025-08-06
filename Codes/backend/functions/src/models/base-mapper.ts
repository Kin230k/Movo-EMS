export abstract class BaseMapper<T> {
  abstract save(entity: T): Promise<void>;
  abstract getById(id: string): Promise<T | null>;
  abstract getAll(): Promise<T[]>;
  abstract delete(id: string): Promise<void>;
}
