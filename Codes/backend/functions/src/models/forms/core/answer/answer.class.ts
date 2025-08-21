// models/answer.class.ts
export type AnswerType = 'text' | 'rating' | 'numeric' | 'options';

export abstract class Answer {
  operation?: any;

  constructor(
    public answerId: string,
    public submissionId: string,
    public questionId: string,
    public answeredAt: Date = new Date()
  ) {}

  abstract getType(): AnswerType;
}

export class TextAnswer extends Answer {
  constructor(
    answerId: string,
    submissionId: string,
    questionId: string,
    public response: string,
    answeredAt?: Date
  ) {
    super(answerId, submissionId, questionId, answeredAt ?? new Date());
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
    answeredAt?: Date
  ) {
    super(answerId, submissionId, questionId, answeredAt ?? new Date());
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
    answeredAt?: Date
  ) {
    super(answerId, submissionId, questionId, answeredAt ?? new Date());
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
    answeredAt?: Date
  ) {
    super(answerId, submissionId, questionId, answeredAt ?? new Date());
    if (!Array.isArray(optionIds))
      throw new Error('optionIds must be an array of UUIDs');
  }
  getType(): AnswerType {
    return 'options';
  }
}
