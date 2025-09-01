// mappers/answers.mapper.ts
import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

import {
  Answer,
  TextAnswer,
  RatingAnswer,
  NumericAnswer,
  OptionsAnswer,
} from './answer.class';
export interface AnswerWithContext {
  answer: Answer; // the mapped Answer object
  questionText: string;
  typeCode: string; // question_types
  formId: string | null;
  formLanguage: string | null;
  formTitle: string | null;
  interviewId: string | null;
}

export class AnswersMapper extends BaseMapper<Answer> {
  getById(id: string): Promise<Answer | null> {
    throw new Error('Method not implemented.');
  }
  async save(entity: Answer): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation as Operation | undefined;
    let { answerId, submissionId, questionId, answeredAt } = entity as any;

    if (!submissionId) throw new Error('Submission ID is required');
    if (!questionId) throw new Error('Question ID is required');

    // subtype values only — we do NOT send an answer_type discriminator
    const textResponse = entity instanceof TextAnswer ? entity.response : null;
    const ratingValue = entity instanceof RatingAnswer ? entity.rating : null;
    const numericResponse =
      entity instanceof NumericAnswer ? entity.response : null;
    const optionIds = entity instanceof OptionsAnswer ? entity.optionIds : null; // uuid[] or null

    const answeredAtISO = answeredAt
      ? answeredAt instanceof Date
        ? answeredAt.toISOString()
        : new Date(answeredAt).toISOString()
      : new Date().toISOString();

    if (op === Operation.UPDATE) {
      if (!answerId) throw new Error('Answer ID is required for update');

      await pool.query(`CALL update_answer($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
        currentUserId,
        answerId,
        submissionId,
        questionId,
        answeredAtISO,
        null, // answer_type is now inferred, so we pass null
        textResponse,
        ratingValue,
        numericResponse,
        optionIds, // uuid[] or null
      ]);
    } else {
      // CREATE: do NOT require answerId. DB function will generate it and return it.
      // Allow callers to optionally pass an answerId (it will be ignored).
      const result = await pool.query(
        `SELECT create_answer($1,$2,$3,$4,$5,$6,$7,$8,$9) AS answer_id`,
        [
          currentUserId,
          submissionId,
          questionId,
          answeredAtISO,
          null, // answer_type (inferred by function)
          textResponse,
          ratingValue,
          numericResponse,
          optionIds,
        ]
      );

      const createdId = result.rows?.[0]?.answer_id ?? null;
      if (!createdId) {
        throw new Error('Failed to create answer: no id returned from DB');
      }

      // update the entity instance so callers have the generated id
      (entity as any).answerId = createdId;
    }
  }

  async getBySubmissionId(submissionId: string): Promise<Answer[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!submissionId) throw new Error('Submission ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_all_answers_by_submission($1, $2)',
      [currentUserId, submissionId]
    );

    return result.rows.map(this.mapRowToAnswer);
  }

  async getAll(): Promise<Answer[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_all_answers($1)',
      [currentUserId]
    );
    return result.rows.map(this.mapRowToAnswer);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Answer ID is required');

    await pool.query('CALL delete_answer($1, $2)', [currentUserId, id]);
  }
    async getManualAnswersBySubmissionId(submissionId:string): Promise<Answer[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if(!submissionId) throw new Error('Submission ID is Required');
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_manual_answers_by_submission($1,$2)',
      [currentUserId,submissionId]
    );
    return result.rows.map(this.mapRowToAnswer);
  }
    async getAnswersBySubmissionId(submissionId:string): Promise<Answer[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if(!submissionId) throw new Error('Submission ID is Required');
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_answers_by_submission_id($1,$2)',
      [currentUserId,submissionId]
    );
    console.log(result)
    return result.rows.map(this.mapRowToAnswer);
  }
  // Add this method to the AnswersMapper class in answer.mapper.ts
async createAnswers(
  submissionId: string,
  answers: any[]
): Promise<string[]> {
  const currentUserId = CurrentUser.uuid;
  if (!currentUserId) throw new Error('Current user UUID is not set');
  if (!submissionId) throw new Error('Submission ID is required');
  if (!answers || !Array.isArray(answers)) {
    throw new Error('Answers must be an array');
  }

  const answersJsonb = JSON.stringify(answers);
  
  const result = await pool.query(
    'SELECT create_answers($1, $2, $3::jsonb) AS answer_ids',
    [currentUserId, submissionId, answersJsonb]
  );

  return result.rows[0].answer_ids;
}
async getQuestionAnswersWithContextBySubmissionId(submissionId: string): Promise<AnswerWithContext[]> {
  const currentUserId = CurrentUser.uuid;
  if (!currentUserId) throw new Error('Current user UUID is not set');
  if (!submissionId) throw new Error('Submission ID is required');

  const result: QueryResult = await pool.query(
    'SELECT * FROM get_question_answers_by_submission_id($1,$2)',
    [currentUserId, submissionId]
  );

  return result.rows.map(this.mapRowToAnswerWithContext);
}

 
private mapRowToAnswer = (row: any): Answer => {
    const answerId = row.answerid;
    const submissionId = row.submissionid;
    const questionId = row.questionid;
    const answeredAt = row.answeredat ? new Date(row.answeredat) : new Date();
    console.log(row);
    const withUpdateOp = (ans: Answer): Answer => {
      ans.operation = Operation.UPDATE;
      return ans;
    };

    // Check for text response first
    if (row.textresponse !== null && row.textresponse !== undefined) {
      return withUpdateOp(
        new TextAnswer(
          answerId,
          submissionId,
          questionId,
          row.textresponse,
          answeredAt
        )
      );
    }
    
    // Check for rating value
    if (row.ratingvalue !== null && row.ratingvalue !== undefined) {
      return withUpdateOp(
        new RatingAnswer(
          answerId,
          submissionId,
          questionId,
          Number(row.ratingvalue),
          answeredAt
        )
      );
    }

    // Check for numeric response
    if (row.numericresponse !== null && row.numericresponse !== undefined) {
      return withUpdateOp(
        new NumericAnswer(
          answerId,
          submissionId,
          questionId,
          Number(row.numericresponse),
          answeredAt
        )
      );
    }

    // Check for options - use array length instead of null check
    if (row.optionids !== null && row.optionids !== undefined && row.optionids.length > 0) {
      const optionIds: string[] = row.optionids || [];
      const optionTexts: any[] = row.optiontexts || [];
      return withUpdateOp(
        new OptionsAnswer(
          answerId,
          submissionId,
          questionId,
          optionIds,
          optionTexts,
          answeredAt
        )
      );
    }

    throw new Error(`Unable to infer answer subtype for answerId=${answerId}`);
};
private mapRowToAnswerWithContext = (row: any): AnswerWithContext => {
  const baseAnswer = this.mapRowToAnswer(row);

  return {
    answer: baseAnswer,
    questionText: row.questiontext,
    typeCode: row.typecode,
    formId: row.formid ?? null,
    formLanguage: row.form_language ?? null,
    formTitle: row.form_title ?? null,
    interviewId: row.interviewid ?? null,
  };
};

}

const answersMapper = new AnswersMapper();
export default answersMapper;
