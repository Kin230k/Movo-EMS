import decisionRuleMapper from './decision_rule.mapper';
import { DecisionRule } from './decision_rule.class';
import { Multilingual } from '../../../multilingual.type';
import { SubmissionOutcome } from '../../../submission_outcome.enum';
import { Operation } from '../../../operation.enum';

export class DecisionRuleService {
  static async createDecisionRule(
    name: Multilingual,
    priority: number,
    formId: string,
    outcomeOnPass?: SubmissionOutcome,
    outcomeOnFail?: SubmissionOutcome,
    description?: Multilingual
  ): Promise<void> {
    const entity = new DecisionRule(name, priority, formId,Operation.CREATE, outcomeOnPass, outcomeOnFail, description);
    await decisionRuleMapper.save(entity);
  }

  static async updateDecisionRule(
    ruleId: string,
    name: Multilingual,
    priority: number,
    formId: string,
    outcomeOnPass?: SubmissionOutcome,
    outcomeOnFail?: SubmissionOutcome,
    description?: Multilingual
  ): Promise<void> {
    const entity = new DecisionRule(name, priority, formId,Operation.UPDATE, outcomeOnPass, outcomeOnFail, description, ruleId);
    await decisionRuleMapper.save(entity);
  }

  static async getDecisionRuleById(id: string): Promise<DecisionRule | null> {
    return await decisionRuleMapper.getById(id);
  }

  static async getAllDecisionRules(): Promise<DecisionRule[]> {
    return await decisionRuleMapper.getAll();
  }

  static async deleteDecisionRule(id: string): Promise<void> {
    await decisionRuleMapper.delete(id);
  }
}