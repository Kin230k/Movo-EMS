import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { CriteriaResult } from './criteria_result.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class CriteriaResultMapper extends BaseMapper<CriteriaResult> {
  async save(entity: CriteriaResult): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { criterionResultId, answerId, criterionId, passed, evaluatedAt } =
      entity;

    if (!answerId) throw new Error('Answer ID is required');
    if (!criterionId) throw new Error('Criterion ID is required');
    if (passed === undefined || passed === null)
      throw new Error('Passed status is required');
    if (!evaluatedAt) throw new Error('EvaluatedAt is required');

    if (op === Operation.UPDATE) {
      if (!criterionResultId)
        throw new Error('CriteriaResult ID is required for update');
      await pool.query('CALL update_criteria_result($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        criterionResultId,
        answerId,
        criterionId,
        passed,
        evaluatedAt,
      ]);
    } else {
      await pool.query('CALL create_criteria_result($1, $2, $3, $4, $5)', [
        currentUserId,
        answerId,
        criterionId,
        passed,
        evaluatedAt,
      ]);
    }
  }

  async getById(id: string): Promise<CriteriaResult | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('CriteriaResult ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_criteria_result_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length
      ? this.mapRowToCriteriaResult(result.rows[0])
      : null;
  }

  async getAll(): Promise<CriteriaResult[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query(
      'SELECT * FROM get_all_criteria_results($1)',
      [currentUserId]
    );
    return result.rows.map(this.mapRowToCriteriaResult);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('CriteriaResult ID is required');

    await pool.query('CALL delete_criteria_result($1, $2)', [
      currentUserId,
      id,
    ]);
  }

  private mapRowToCriteriaResult = (row: any): CriteriaResult => {
    return new CriteriaResult(
      row.answerid,
      row.criterionid,
      row.passed,
      row.evaluatedat,
      row.criterionresultid
    );
  };
}

const criteriaResultMapper = new CriteriaResultMapper();
export default criteriaResultMapper;
