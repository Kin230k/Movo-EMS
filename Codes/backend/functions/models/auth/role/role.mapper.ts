import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { Role } from "./role.class";
import type { Pool, QueryResult } from 'pg';

export class RoleMapper extends BaseMapper<Role> {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entity: Role): Promise<void> {
    const op = entity.operation;
    const { roleId, name, description } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.roleId) throw new Error('Role ID is required for update');
      await this.pool.query(
        'CALL update_role($1, $2, $3)',
        [roleId, name, description]
      );
    } else {
      await this.pool.query(
        'CALL create_role($1, $2)',
        [name, description]
      );
    }
  }

  async getById(id: string): Promise<Role | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_role_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Role[]> {
    const result = await this.pool.query('SELECT * FROM get_all_roles()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_role($1)', [id]);
  }

private mapRowToEntity = (row: any): Role => {
  return new Role(
    row.name, // JSONB object
    row.roleId,
    row.description // JSONB object (nullable)
  );
};
}