import { Operation } from '../../../operation.enum';

// models/answer.class.ts
export type AnswerType = 'text' | 'rating' | 'numeric' | 'options';

export abstract class Answer {
  operation?: Operation = Operation.CREATE;

  constructor(
    public answerId: string,
    public submissionId: string,
    public questionId: string,
    public answeredAt: string = new Date().toISOString()
  ) {}

  abstract getType(): AnswerType;
}

export class TextAnswer extends Answer {
  constructor(
    answerId: string,
    submissionId: string,
    questionId: string,
    public response: string,
    answeredAt?: string
  ) {
    super(answerId, submissionId, questionId, answeredAt ?? new Date().toISOString());
  }
  getType(): AnswerType {
    return 'text';
  }
}

export class RatingAnswer extends Answer {
  constructor(
    answerId: string,
    submissionId: string,
    questionId: string,
    public rating: number,
    answeredAt?: string
  ) {
    super(answerId, submissionId, questionId, answeredAt ?? new Date().toISOString());
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('rating must be integer between 1 and 5');
    }
  }
  getType(): AnswerType {
    return 'rating';
  }
}

export class NumericAnswer extends Answer {
  constructor(
    answerId: string,
    submissionId: string,
    questionId: string,
    public response: number,
    answeredAt?: string
  ) {
    super(answerId, submissionId, questionId, answeredAt ?? new Date().toISOString());
    if (Number.isNaN(response))
      throw new Error('numeric response must be a number');
  }
  getType(): AnswerType {
    return 'numeric';
  }
}

export class OptionsAnswer extends Answer {
  constructor(
    answerId: string,
    submissionId: string,
    questionId: string,
    public optionIds: string[],
    public optionTexts?: any[],
    answeredAt?: string
  ) {
    super(answerId, submissionId, questionId, answeredAt ?? new Date().toISOString());
    if (!Array.isArray(optionIds))
      throw new Error('optionIds must be an array of UUIDs');
  }
  getType(): AnswerType {
    return 'options';
  }
}
