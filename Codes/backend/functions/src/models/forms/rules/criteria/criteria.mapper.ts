import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Criteria } from './criteria.class';
import pool from '../../../../utils/pool';
import type { QueryResult } from 'pg';

export class CriteriaMapper extends BaseMapper<Criteria> {
  async save(entity: Criteria): Promise<void> {
    const op = entity.operation;
    const { criterionId, type, value, questionId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.criterionId)
        throw new Error('Criteria ID is required for update');
      await pool.query('CALL update_criteria($1, $2, $3, $4)', [
        criterionId,
        type,
        value,
        questionId,
      ]);
    } else {
      await pool.query('CALL create_criteria($1, $2, $3)', [
        type,
        value,
        questionId,
      ]);
    }
  }

  async getById(id: string): Promise<Criteria | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_criteria_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Criteria[]> {
    const result = await pool.query('SELECT * FROM get_all_criteria()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_criteria($1)', [id]);
  }

  private mapRowToEntity = (row: any): Criteria => {
    return new Criteria(row.criterionId, row.type, row.value, row.questionId);
  };
}
const criteriaMapper = new CriteriaMapper();
export default criteriaMapper;
