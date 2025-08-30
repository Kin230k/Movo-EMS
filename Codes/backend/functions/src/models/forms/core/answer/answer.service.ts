import { Operation } from '../../../operation.enum';
import answersMapper from './answer.mapper';
import {
  Answer,
  TextAnswer,
  RatingAnswer,
  NumericAnswer,
  OptionsAnswer,
  AnswerType,
} from './answer.class';

export class AnswerService {
  /**
   * Create a new text answer (DB generates answerId). Returns generated answerId.
   */
  static async createTextAnswer(
    submissionId: string,
    questionId: string,
    response: string,
    answeredAt?: Date
  ): Promise<string> {
    // pass a placeholder for answerId; mapper/DB will generate and set it back on the entity
    const answer = new TextAnswer(
      null as any,
      submissionId,
      questionId,
      response,
      answeredAt
    );
    await answersMapper.save(answer);
    return (answer as any).answerId as string;
  }

  /**
   * Create a new rating answer (DB generates answerId). Returns generated answerId.
   */
  static async createRatingAnswer(
    submissionId: string,
    questionId: string,
    rating: number,
    answeredAt?: Date
  ): Promise<string> {
    const answer = new RatingAnswer(
      null as any,
      submissionId,
      questionId,
      rating,
      answeredAt
    );
    await answersMapper.save(answer);
    return (answer as any).answerId as string;
  }

  /**
   * Create a new numeric answer (DB generates answerId). Returns generated answerId.
   */
  static async createNumericAnswer(
    submissionId: string,
    questionId: string,
    response: number,
    answeredAt?: Date
  ): Promise<string> {
    const answer = new NumericAnswer(
      null as any,
      submissionId,
      questionId,
      response,
      answeredAt
    );
    await answersMapper.save(answer);
    return (answer as any).answerId as string;
  }

  /**
   * Create a new options answer (DB generates answerId). Returns generated answerId.
   */
  static async createOptionsAnswer(
    submissionId: string,
    questionId: string,
    optionIds: string[],
    optionTexts?: any[],
    answeredAt?: Date
  ): Promise<string> {
    const answer = new OptionsAnswer(
      null as any,
      submissionId,
      questionId,
      optionIds,
      optionTexts,
      answeredAt
    );
    await answersMapper.save(answer);
    return (answer as any).answerId as string;
  }

  /**
   * Update an existing answer
   */
  static async updateAnswer(
    answer: Answer,
    operation: Operation = Operation.UPDATE
  ): Promise<void> {
    (answer as any).operation = operation;
    await answersMapper.save(answer);
  }

  /**
   * Get all answers for a specific submission
   */
  static async getAnswersBySubmissionId(
    submissionId: string
  ): Promise<Answer[]> {
    return await answersMapper.getBySubmissionId(submissionId);
  }
    static async getManualAnswersBySubmissionId(
    submissionId: string
  ): Promise<Answer[]> {
    return await answersMapper.getManualAnswersBySubmissionId(submissionId);
  }


  /**
   * Get all answers
   */
  static async getAllAnswers(): Promise<Answer[]> {
    return await answersMapper.getAll();
  }

  /**
   * Delete an answer
   */
  static async deleteAnswer(answerId: string): Promise<void> {
    await answersMapper.delete(answerId);
  }

  /**
   * Get answer by ID (to be implemented when mapper supports it)
   */
  static async getAnswerById(answerId: string): Promise<Answer | null> {
    // This will need to be implemented in the mapper first
    throw new Error('Not implemented yet');
  }

  /**
   * Helper method to create an answer based on type.
   * DB generates answerId; returns generated answerId.
   */
  static async createAnswer(
    type: AnswerType,
    submissionId: string,
    questionId: string,
    data: any,
    answeredAt?: Date
  ): Promise<string> {
    switch (type) {
      case 'text':
        return await this.createTextAnswer(
          submissionId,
          questionId,
          data.response,
          answeredAt
        );
      case 'rating':
        return await this.createRatingAnswer(
          submissionId,
          questionId,
          data.rating,
          answeredAt
        );
      case 'numeric':
        return await this.createNumericAnswer(
          submissionId,
          questionId,
          data.response,
          answeredAt
        );
      case 'options':
        return await this.createOptionsAnswer(
          submissionId,
          questionId,
          data.optionIds,
          data.optionTexts,
          answeredAt
        );
      default:
        throw new Error(`Unknown answer type: ${type}`);
    }
  }
}
