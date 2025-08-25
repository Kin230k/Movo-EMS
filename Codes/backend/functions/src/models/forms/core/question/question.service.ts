import questionMapper from './question.mapper';
import { Question } from './question.class';
import { Multilingual } from '../../../multilingual.type';
import { Operation } from '../../../operation.enum';

export class QuestionService {
  static async createQuestion(
    typeCode: string,
    questionText: Multilingual,
    formId: string,
    interviewId: string
  ): Promise<void> {
    const entity = new Question(
      typeCode,
      questionText,
      formId,
      interviewId,
      Operation.CREATE
    );
    await questionMapper.save(entity);
  }

  static async updateQuestion(
    questionId: string,
    typeCode: string,
    questionText: Multilingual,
    formId: string,
    interviewId: string
  ): Promise<void> {
    const entity = new Question(
      typeCode,
      questionText,
      formId,
      interviewId,
      Operation.UPDATE,
      questionId
    );
    await questionMapper.save(entity);
  }

  static async getQuestionById(id: string): Promise<Question | null> {
    return await questionMapper.getById(id);
  }

  static async getAllQuestions(): Promise<Question[]> {
    return await questionMapper.getAll();
  }
  static async getAllQuestionsByFormId(formId: string): Promise<Question[]> {
    return await questionMapper.getAllByFormId(formId);
  }

  static async deleteQuestion(id: string): Promise<void> {
    await questionMapper.delete(id);
  }
}
