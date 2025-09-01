export type QuestionTypeCode =
  | 'OPEN_ENDED'
  | 'SHORT_ANSWER'
  | 'NUMBER'
  | 'RATE'
  | 'DROPDOWN'
  | 'RADIO'
  | 'MULTIPLE_CHOICE';

export interface FormOptionDto {
  optionId: string;
  optionText: string;
}

export interface FormQuestionDto {
  questionId: string;
  typeCode: QuestionTypeCode;
  questionText: string;
  options?: FormOptionDto[];
  required?: boolean;
  min?: number;
  max?: number;
}

export interface DynamicFormDto {
  formId: string;
  formTitle: string;
  formLanguage: string;
  questions: FormQuestionDto[];
}

export type AnswerValue = string | number | string[] | null;

export type FormAnswersMap = Record<string, AnswerValue>;
