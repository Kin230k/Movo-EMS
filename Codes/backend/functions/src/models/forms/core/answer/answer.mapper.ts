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

export class AnswersMapper extends BaseMapper<Answer> {
  getById(id: string): Promise<Answer | null> {
    throw new Error('Method not implemented.');
  }
  async save(entity: Answer): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = (entity as any).operation as Operation | undefined;
    const { answerId, submissionId, questionId, answeredAt } = entity as any;

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
      if (!answerId) throw new Error('Answer ID is required for create');
      await pool.query(`CALL create_answer($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
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

  private mapRowToAnswer = (row: any): Answer => {
    const answerId = row.answerId;
    const submissionId = row.submissionId;
    const questionId = row.questionId;
    const answeredAt = row.answeredAt ? new Date(row.answeredAt) : new Date();

    // infer subtype by which returned subtype columns are present
    // priority: text -> rating -> options (non-empty) -> numeric
    if (row.textResponse != null) {
      return new TextAnswer(
        answerId,
        submissionId,
        questionId,
        row.textResponse,
        answeredAt
      );
    }
    if (row.ratingValue != null) {
      return new RatingAnswer(
        answerId,
        submissionId,
        questionId,
        Number(row.ratingValue),
        answeredAt
      );
    }
    if (
      row.optionIds != null &&
      Array.isArray(row.optionIds) &&
      row.optionIds.length > 0
    ) {
      const optionIds: string[] = row.optionIds;
      const optionTexts: any[] = row.optionTexts ?? null;
      return new OptionsAnswer(
        answerId,
        submissionId,
        questionId,
        optionIds,
        optionTexts,
        answeredAt
      );
    }
    if (row.numericResponse != null) {
      return new NumericAnswer(
        answerId,
        submissionId,
        questionId,
        Number(row.numericResponse),
        answeredAt
      );
    }

    // Fallback: if nothing present, throw so you notice incomplete rows
    throw new Error(`Unable to infer answer subtype for answerId=${answerId}`);
  };
}

const answersMapper = new AnswersMapper();
export default answersMapper;
