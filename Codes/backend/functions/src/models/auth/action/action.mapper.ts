import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Action } from './action.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';

export class ActionMapper extends BaseMapper<Action> {
  async save(entity: Action): Promise<void> {
    const op = entity.operation;
    const { actionId, actionType } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.actionId) throw new Error('Action ID is required for update');
      await pool.query('CALL update_action($1, $2)', [actionId, actionType]);
    } else {
      await pool.query('CALL create_action($1)', [actionType]);
    }
  }

  async getById(id: string): Promise<Action | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_action_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Action[]> {
    const result = await pool.query('SELECT * FROM get_all_actions()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_action($1)', [id]);
  }

  private mapRowToEntity = (row: any): Action => {
    return new Action(row.actionType, row.actionId);
  };
}
const actionMapper = new ActionMapper();
export default actionMapper;
