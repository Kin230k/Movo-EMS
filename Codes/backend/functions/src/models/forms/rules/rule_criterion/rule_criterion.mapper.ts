import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { RuleCriterion } from './rule_criterion.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class RuleCriterionMapper extends BaseMapper<RuleCriterion> {
  constructor() {
    super(pool);
  }

  async save(entity: RuleCriterion): Promise<void> {
    const op = entity.operation;
    const { ruleCriterionId, ruleId, criterionId, required } = entity;

    if (op === Operation.UPDATE) {
      if (!ruleCriterionId) throw new Error('RuleCriterion ID required for update');
      await this.pool.query(
        'CALL update_rule_criterion($1, $2, $3, $4)',
        [ruleCriterionId, ruleId, criterionId, required]
      );
    } else {
      await this.pool.query(
        'CALL create_rule_criterion($1, $2, $3)',
        [ruleId, criterionId, required]
      );
    }
  }

  async getById(id: string): Promise<RuleCriterion | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_rule_criterion_by_id($1)',
      [id]
    );
    return result.rows.length ? new RuleCriterion(
      result.rows[0].ruleId,
      result.rows[0].criterionId,
      result.rows[0].required,
      result.rows[0].ruleCriterionId
    ) : null;
  }

  async getAll(): Promise<RuleCriterion[]> {
    const result = await this.pool.query('SELECT * FROM get_all_rule_criterions()');
    return result.rows.map(row => new RuleCriterion(
      row.ruleId,
      row.criterionId,
      row.required,
      row.ruleCriterionId
    ));
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_rule_criterion($1)', [id]);
  }
}

const rulecriterionMapper = new RuleCriterionMapper();
export default rulecriterionMapper;
