import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { RoleAction } from './role_action.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';

export class RoleActionMapper extends BaseMapper<RoleAction> {
  async save(entity: RoleAction): Promise<void> {
    const op = entity.operation;
    const { roleActionsId, roleId, actionId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.roleActionsId)
        throw new Error('RoleAction ID is required for update');
      await pool.query('CALL update_role_action($1, $2, $3)', [
        roleActionsId,
        roleId,
        actionId,
      ]);
    } else {
      await pool.query('CALL create_role_action($1, $2)', [roleId, actionId]);
    }
  }

  async getById(id: string): Promise<RoleAction | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_role_action_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<RoleAction[]> {
    const result = await pool.query('SELECT * FROM get_all_role_actions()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_role_action($1)', [id]);
  }

  private mapRowToEntity = (row: any): RoleAction => {
    return new RoleAction(row.roleId, row.actionId, row.roleActionsId);
  };
}
const roleActionMapper = new RoleActionMapper();
export default roleActionMapper;
