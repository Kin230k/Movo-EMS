import criteriaMapper from './criteria.mapper';
import { Criteria } from './criteria.class';
import { CriteriaOperator } from '../../../criteria_operator.enum';
import { Operation } from '../../../operation.enum';

export class CriteriaService {
  static async createCriterion(
    type: CriteriaOperator,
    value: string,
    questionId: string
  ): Promise<void> {
    const entity = new Criteria(type, value,Operation.CREATE, questionId);
    await criteriaMapper.save(entity);
  }

  static async updateCriterion(
    criterionId: string,
    type: CriteriaOperator,
    value: string,
    questionId: string
  ): Promise<void> {
    const entity = new Criteria(type, value,Operation.UPDATE, questionId, criterionId);
    await criteriaMapper.save(entity);
  }

  static async getCriterionById(id: string): Promise<Criteria | null> {
    return await criteriaMapper.getById(id);
  }

  static async getAllCriteria(): Promise<Criteria[]> {
    return await criteriaMapper.getAll();
  }

  static async deleteCriterion(id: string): Promise<void> {
    await criteriaMapper.delete(id);
  }
}