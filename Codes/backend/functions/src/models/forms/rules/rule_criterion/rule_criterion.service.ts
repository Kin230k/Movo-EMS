import ruleCriterionMapper from './rule_criterion.mapper';
import { RuleCriterion } from './rule_criterion.class';
import { Operation } from '../../../operation.enum';

export class RuleCriterionService {
  static async createRuleCriterion(
    ruleId: string,
    criterionId: string,
    required: boolean
  ): Promise<void> {
    const entity = new RuleCriterion(ruleId, criterionId, required,Operation.CREATE);
    await ruleCriterionMapper.save(entity);
  }

  static async updateRuleCriterion(
    ruleCriterionId: string,
    ruleId: string,
    criterionId: string,
    required: boolean
  ): Promise<void> {
    const entity = new RuleCriterion(ruleId, criterionId, required,Operation.UPDATE, ruleCriterionId);
    await ruleCriterionMapper.save(entity);
  }

  static async getRuleCriterionById(id: string): Promise<RuleCriterion | null> {
    return await ruleCriterionMapper.getById(id);
  }

  static async getAllRuleCriteria(): Promise<RuleCriterion[]> {
    return await ruleCriterionMapper.getAll();
  }

  static async deleteRuleCriterion(id: string): Promise<void> {
    await ruleCriterionMapper.delete(id);
  }
}