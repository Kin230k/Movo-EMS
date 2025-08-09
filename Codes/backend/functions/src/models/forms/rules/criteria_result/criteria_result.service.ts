import criteriaResultMapper from './criteria_result.mapper';
import { CriteriaResult } from './criteria_result.class';
import { Operation } from '../../../operation.enum';

export class CriteriaResultService {
  static async createCriteriaResult(
    answerId: string,
    criterionId: string,
    passed: boolean,
    evaluatedAt: Date
  ): Promise<void> {
    const entity = new CriteriaResult(answerId, criterionId, passed, evaluatedAt,Operation.CREATE);
    await criteriaResultMapper.save(entity);
  }

  static async updateCriteriaResult(
    criterionResultId: string,
    answerId: string,
    criterionId: string,
    passed: boolean,
    evaluatedAt: Date
  ): Promise<void> {
    const entity = new CriteriaResult(answerId, criterionId, passed, evaluatedAt,Operation.UPDATE, criterionResultId);
    await criteriaResultMapper.save(entity);
  }

  static async getCriteriaResultById(id: string): Promise<CriteriaResult | null> {
    return await criteriaResultMapper.getById(id);
  }

  static async getAllCriteriaResults(): Promise<CriteriaResult[]> {
    return await criteriaResultMapper.getAll();
  }

  static async deleteCriteriaResult(id: string): Promise<void> {
    await criteriaResultMapper.delete(id);
  }
}