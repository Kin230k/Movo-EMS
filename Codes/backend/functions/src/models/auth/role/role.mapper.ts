import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Role } from './role.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class RoleMapper extends BaseMapper<Role> {
  async save(entity: Role): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    
    const op = entity.operation;
    const { roleId, name, description } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.roleId) throw new Error('Role ID is required for update');
      await pool.query('CALL update_role($1, $2, $3, $4)', [
        currentUserId,
        roleId,
        name,
        description,
      ]);
    } else {
      await pool.query('CALL create_role($1, $2, $3)', [currentUserId, name, description]);
    }
  }

  async getById(id: string): Promise<Role | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_role_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Role[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    
    const result = await pool.query('SELECT * FROM get_all_roles($1)', [currentUserId]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    
    await pool.query('CALL delete_role($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): Role => {
    return new Role(
      row.name,
      row.roleId,
      row.description
    );
  };
}
const roleMapper = new RoleMapper();
export default roleMapper;