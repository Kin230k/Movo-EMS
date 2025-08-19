import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { RuleCriterion } from './rule_criterion.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class RuleCriterionMapper extends BaseMapper<RuleCriterion> {
  async save(entity: RuleCriterion): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { ruleCriterionId, ruleId, criterionId, required } = entity;

    if (!ruleId) throw new Error('Rule ID is required');
    if (!criterionId) throw new Error('Criterion ID is required');
    if (required === undefined || required === null)
      throw new Error('Required flag is required');

    if (op === Operation.UPDATE) {
      if (!ruleCriterionId)
        throw new Error('RuleCriterion ID is required for update');
      await pool.query('CALL update_rule_criterion($1, $2, $3, $4, $5)', [
        currentUserId,
        ruleCriterionId,
        ruleId,
        criterionId,
        required,
      ]);
    } else {
      await pool.query('CALL create_rule_criterion($1, $2, $3, $4)', [
        currentUserId,
        ruleId,
        criterionId,
        required,
      ]);
    }
  }

  async getById(id: string): Promise<RuleCriterion | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('RuleCriterion ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_rule_criterion_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length
      ? this.mapRowToRuleCriterion(result.rows[0])
      : null;
  }

  async getAll(): Promise<RuleCriterion[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query(
      'SELECT * FROM get_all_rule_criterions($1)',
      [currentUserId]
    );
    return result.rows.map(this.mapRowToRuleCriterion);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('RuleCriterion ID is required');

    await pool.query('CALL delete_rule_criterion($1, $2)', [currentUserId, id]);
  }

  private mapRowToRuleCriterion = (row: any): RuleCriterion => {
    return new RuleCriterion(
      row.ruleId,
      row.criterionId,
      row.required,
      row.ruleCriterionId
    );
  };
}

const ruleCriterionMapper = new RuleCriterionMapper();
export default ruleCriterionMapper;
