import { Operation } from '../../../operation.enum';
import answersMapper from './answer.mapper';
import {
  Answer,
  TextAnswer,
  RatingAnswer,
  NumericAnswer,
  OptionsAnswer,
  AnswerType
} from './answer.class';

export class AnswerService {
  /**
   * Create a new text answer
   */
  static async createTextAnswer(
    answerId: string,
    submissionId: string,
    questionId: string,
    response: string,
    answeredAt?: Date
  ): Promise<void> {
    const answer = new TextAnswer(
      answerId,
      submissionId,
      questionId,
      response,
      answeredAt
    );
    await answersMapper.save(answer);
  }

  /**
   * Create a new rating answer
   */
  static async createRatingAnswer(
    answerId: string,
    submissionId: string,
    questionId: string,
    rating: number,
    answeredAt?: Date
  ): Promise<void> {
    const answer = new RatingAnswer(
      answerId,
      submissionId,
      questionId,
      rating,
      answeredAt
    );
    await answersMapper.save(answer);
  }

  /**
   * Create a new numeric answer
   */
  static async createNumericAnswer(
    answerId: string,
    submissionId: string,
    questionId: string,
    response: number,
    answeredAt?: Date
  ): Promise<void> {
    const answer = new NumericAnswer(
      answerId,
      submissionId,
      questionId,
      response,
      answeredAt
    );
    await answersMapper.save(answer);
  }

  /**
   * Create a new options answer
   */
  static async createOptionsAnswer(
    answerId: string,
    submissionId: string,
    questionId: string,
    optionIds: string[],
    optionTexts?: any[],
    answeredAt?: Date
  ): Promise<void> {
    const answer = new OptionsAnswer(
      answerId,
      submissionId,
      questionId,
      optionIds,
      optionTexts,
      answeredAt
    );
    await answersMapper.save(answer);
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
  static async getAnswersBySubmissionId(submissionId: string): Promise<Answer[]> {
    return await answersMapper.getBySubmissionId(submissionId);
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
   * Helper method to create an answer based on type
   */
  static async createAnswer(
    type: AnswerType,
    answerId: string,
    submissionId: string,
    questionId: string,
    data: any,
    answeredAt?: Date
  ): Promise<void> {
    switch (type) {
      case 'text':
        await this.createTextAnswer(
          answerId,
          submissionId,
          questionId,
          data.response,
          answeredAt
        );
        break;
      case 'rating':
        await this.createRatingAnswer(
          answerId,
          submissionId,
          questionId,
          data.rating,
          answeredAt
        );
        break;
      case 'numeric':
        await this.createNumericAnswer(
          answerId,
          submissionId,
          questionId,
          data.response,
          answeredAt
        );
        break;
      case 'options':
        await this.createOptionsAnswer(
          answerId,
          submissionId,
          questionId,
          data.optionIds,
          data.optionTexts,
          answeredAt
        );
        break;
      default:
        throw new Error(`Unknown answer type: ${type}`);
    }
  }
}