import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Criteria } from './criteria.class';
import pool from '../../../../utils/pool';
import type { QueryResult } from 'pg';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class CriteriaMapper extends BaseMapper<Criteria> {
  async save(entity: Criteria): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { criterionId, type, value, questionId,criterion_effect } = entity;

    if (!type) throw new Error('Criteria type is required');
    if (!value) throw new Error('Criteria value is required');
    if (!questionId) throw new Error('Question ID is required');
    if(!criterion_effect) throw new Error("criterion_effect is required")

    if (op === Operation.UPDATE) {
      if (!criterionId) throw new Error('Criteria ID is required for update');
      await pool.query('CALL update_criterion($1, $2, $3, $4, $5,$6)', [
        currentUserId,
        criterionId,
        type,
        value,
        questionId,
        criterion_effect
        
      ]);
    } else {
     
      await pool.query('CALL create_criterion($1, $2, $3, $4,$5)', [
        currentUserId,
        type,
        value,
        questionId,
        criterion_effect,
      ]);
      
    }
  }

  async getById(id: string): Promise<Criteria | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Criteria ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_criterion_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToCriteria(result.rows[0]) : null;
  }

  async getAll(): Promise<Criteria[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_criteria($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToCriteria);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Criteria ID is required');

    await pool.query('CALL delete_criteria($1, $2)', [currentUserId, id]);
  }

  private mapRowToCriteria = (row: any): Criteria => {
    return new Criteria(row.criterionid, row.type, row.value, row.questionid,row.effect);
  };
}

const criteriaMapper = new CriteriaMapper();
export default criteriaMapper;
