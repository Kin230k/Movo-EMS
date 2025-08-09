import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { CriteriaResult } from './criteria_result.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class CriteriaResultMapper extends BaseMapper<CriteriaResult> {
  async save(entity: CriteriaResult): Promise<void> {
    const op = entity.operation;
    const { criterionResultId, answerId, criterionId, passed, evaluatedAt } =
      entity;

    if (op === Operation.UPDATE) {
      if (!criterionResultId)
        throw new Error('CriteriaResult ID required for update');
      await pool.query('CALL update_criteria_result($1, $2, $3, $4, $5)', [
        criterionResultId,
        answerId,
        criterionId,
        passed,
        evaluatedAt,
      ]);
    } else {
      await pool.query('CALL create_criteria_result($1, $2, $3, $4)', [
        answerId,
        criterionId,
        passed,
        evaluatedAt,
      ]);
    }
  }

  async getById(id: string): Promise<CriteriaResult | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_criteria_result_by_id($1)',
      [id]
    );
    return result.rows.length
      ? new CriteriaResult(
          result.rows[0].answerId,
          result.rows[0].criterionId,
          result.rows[0].passed,
          result.rows[0].evaluatedAt,
          result.rows[0].criterionResultId
        )
      : null;
  }

  async getAll(): Promise<CriteriaResult[]> {
    const result = await pool.query('SELECT * FROM get_all_criteria_results()');
    return result.rows.map(
      (row) =>
        new CriteriaResult(
          row.answerId,
          row.criterionId,
          row.passed,
          row.evaluatedAt,
          row.criterionResultId
        )
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_criteria_result($1)', [id]);
  }
}

const criteriaresultMapper = new CriteriaResultMapper();
export default criteriaresultMapper;
