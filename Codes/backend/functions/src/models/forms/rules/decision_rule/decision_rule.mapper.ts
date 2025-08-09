import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { DecisionRule } from './decision_rule.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class DecisionRuleMapper extends BaseMapper<DecisionRule> {
  constructor() {
    super(pool);
  }

  async save(entity: DecisionRule): Promise<void> {
    const op = entity.operation;
    const { ruleId, name, description, formId, priority, outcomeOnPass, outcomeOnFail } = entity;

    if (op === Operation.UPDATE) {
      if (!ruleId) throw new Error('DecisionRule ID required for update');
      await this.pool.query(
        'CALL update_decision_rule($1, $2, $3, $4, $5, $6, $7)',
        [ruleId, name, description, formId, priority, outcomeOnPass, outcomeOnFail]
      );
    } else {
      await this.pool.query(
        'CALL create_decision_rule($1, $2, $3, $4, $5, $6)',
        [name, description, formId, priority, outcomeOnPass, outcomeOnFail]
      );
    }
  }

  async getById(id: string): Promise<DecisionRule | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_decision_rule_by_id($1)',
      [id]
    );
    return result.rows.length ? new DecisionRule(
      result.rows[0].name,
      result.rows[0].priority,
      result.rows[0].formId,
      result.rows[0].outcomeOnPass,
      result.rows[0].outcomeOnFail,
      result.rows[0].description,
      result.rows[0].ruleId
    ) : null;
  }

  async getAll(): Promise<DecisionRule[]> {
    const result = await this.pool.query('SELECT * FROM get_all_decision_rules()');
    return result.rows.map(row => new DecisionRule(
      row.name,
      row.priority,
      row.formId,
      row.outcomeOnPass,
      row.outcomeOnFail,
      row.description,
      row.ruleId
    ));
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_decision_rule($1)', [id]);
  }
}

const decisionruleMapper = new DecisionRuleMapper();
export default decisionruleMapper;
