import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { RoleAction } from './role_action.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class RoleActionMapper extends BaseMapper<RoleAction> {
  async save(entity: RoleAction): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    
    const op = entity.operation;
    const { roleActionsId, roleId, actionId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.roleActionsId) throw new Error('RoleAction ID is required for update');
      await pool.query('CALL update_role_action($1, $2, $3, $4)', [
        currentUserId,
        roleActionsId,
        roleId,
        actionId,
      ]);
    } else {
      await pool.query('CALL create_role_action($1, $2, $3)', [currentUserId, roleId, actionId]);
    }
  }

  async getById(id: string): Promise<RoleAction | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_role_action_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<RoleAction[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    
    const result = await pool.query('SELECT * FROM get_all_role_actions($1)', [currentUserId]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    
    await pool.query('CALL delete_role_action($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): RoleAction => {
    return new RoleAction(row.roleId, row.actionId, row.roleActionsId);
  };
}
const roleActionMapper = new RoleActionMapper();
export default roleActionMapper;