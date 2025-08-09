import questionTypeMapper from './question_type.mapper';
import { QuestionType } from './question_type.class';
import { Multilingual } from '../../../multilingual.type';
import { Operation } from '../../../operation.enum';

export class QuestionTypeService {
  static async createQuestionType(description: Multilingual): Promise<void> {
    const entity = new QuestionType(description,Operation.CREATE);
    await questionTypeMapper.save(entity);
  }

  static async updateQuestionType(typeCode: string, description: Multilingual): Promise<void> {
    const entity = new QuestionType(description,Operation.UPDATE, typeCode);
    await questionTypeMapper.save(entity);
  }

  static async getQuestionTypeById(id: string): Promise<QuestionType | null> {
    return await questionTypeMapper.getById(id);
  }

  static async getAllQuestionTypes(): Promise<QuestionType[]> {
    return await questionTypeMapper.getAll();
  }

  static async deleteQuestionType(id: string): Promise<void> {
    await questionTypeMapper.delete(id);
  }
}