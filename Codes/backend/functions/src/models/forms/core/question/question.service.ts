import questionMapper from './question.mapper';
import { Question } from './question.class';

export class QuestionService {
  static async createQuestion(
    typeCode:
      | 'OPEN_ENDED'
      | 'SHORT_ANSWER'
      | 'NUMBER'
      | 'RATE'
      | 'DROPDOWN'
      | 'RADIO'
      | 'MULTIPLE_CHOICE',
    questionText: string, // Changed from Multilingual to string
    formId: string | null,
    interviewId: string | null
  ): Promise<Question> {
    const entity = new Question(
      typeCode,
      questionText, // Now passes string directly
      formId,
      interviewId
    );
    await questionMapper.save(entity);
    return entity;
  }

  static async updateQuestion(
    questionId: string,
    typeCode:
      | 'OPEN_ENDED'
      | 'SHORT_ANSWER'
      | 'NUMBER'
      | 'RATE'
      | 'DROPDOWN'
      | 'RADIO'
      | 'MULTIPLE_CHOICE',
    questionText: string, // Changed from Multilingual to string
    formId: string | null,
    interviewId: string | null
  ): Promise<void> {
    const entity = new Question(
      typeCode,
      questionText, // Now passes string directly
      formId,
      interviewId,
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
static async getAllQuestionsByInterviewId(
  interviewId: string
): Promise<{ interviewTitle: string | null, questions: Question[] }> {
  return await questionMapper.getAllByInterviewId(interviewId);
}

  static async deleteQuestion(id: string): Promise<void> {
    await questionMapper.delete(id);
  }
}
