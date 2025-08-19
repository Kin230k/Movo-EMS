import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { DecisionRule } from './decision_rule.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class DecisionRuleMapper extends BaseMapper<DecisionRule> {
  async save(entity: DecisionRule): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const {
      ruleId,
      name,
      description,
      formId,
      priority,
      outcomeOnPass,
      outcomeOnFail,
    } = entity;

    if (!name) throw new Error('DecisionRule name is required');
    if (!formId) throw new Error('Form ID is required');
    if (priority === undefined || priority === null)
      throw new Error('Priority is required');

    if (op === Operation.UPDATE) {
      if (!ruleId) throw new Error('DecisionRule ID is required for update');
      await pool.query(
        'CALL update_decision_rule($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          currentUserId,
          ruleId,
          name,
          description,
          formId,
          priority,
          outcomeOnPass,
          outcomeOnFail,
        ]
      );
    } else {
      await pool.query(
        'CALL create_decision_rule($1, $2, $3, $4, $5, $6, $7)',
        [
          currentUserId,
          name,
          description,
          formId,
          priority,
          outcomeOnPass,
          outcomeOnFail,
        ]
      );
    }
  }

  async getById(id: string): Promise<DecisionRule | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('DecisionRule ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_decision_rule_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length
      ? this.mapRowToDecisionRule(result.rows[0])
      : null;
  }

  async getAll(): Promise<DecisionRule[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query(
      'SELECT * FROM get_all_decision_rules($1)',
      [currentUserId]
    );
    return result.rows.map(this.mapRowToDecisionRule);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('DecisionRule ID is required');

    await pool.query('CALL delete_decision_rule($1, $2)', [currentUserId, id]);
  }

  private mapRowToDecisionRule = (row: any): DecisionRule => {
    return new DecisionRule(
      row.name,
      row.priority,
      row.formid,
      row.outcomeonpass,
      row.outcomeonfail,
      row.description,
      row.ruleid
    );
  };
}

const decisionRuleMapper = new DecisionRuleMapper();
export default decisionRuleMapper;
