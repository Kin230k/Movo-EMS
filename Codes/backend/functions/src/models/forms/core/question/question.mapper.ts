import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Question } from './question.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class QuestionMapper extends BaseMapper<Question> {
  async save(entity: Question): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { questionId, typeCode, questionText, formId, interviewId } = entity;

    if (!typeCode) throw new Error('Question type code is required');
    if (!questionText) throw new Error('Question text is required');

    if (op === Operation.UPDATE) {
      if (!questionId) throw new Error('Question ID is required for update');
      await pool.query('CALL update_question($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        questionId,
        typeCode,
        questionText, // Now passes string directly
        formId || null,
        interviewId || null,
      ]);
    } else {
      const result: QueryResult = await pool.query(
        'SELECT create_question($1, $2, $3, $4, $5) as question_id',
        [
          currentUserId,
          typeCode,
          questionText, // Now passes string directly
          formId || null,
          interviewId || null,
        ]
      );
      // Set the questionId on the entity object
      entity.questionId = result.rows[0].question_id;
    }
  }

  async getById(id: string): Promise<Question | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Question ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_question_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToQuestion(result.rows[0]) : null;
  }

  async getAll(): Promise<Question[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_questions($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToQuestion);
  }

  private parseCriteriaInPlace = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    // if it's a single object or jsonb that's not array, return empty array
    return [];
  };

  // normalize keys of each criterion object in-place (no new objects created)
  private normalizeCriteriaKeysInPlace = (criteria: any[]): void => {
    for (let i = 0; i < criteria.length; i++) {
      const c = criteria[i];
      if (!c || typeof c !== 'object') continue;

      // prefer camelCase keys for JS side; assign to existing object properties
      if (c.criterionid !== undefined && c.criterionId === undefined) {
        // assign new key on same object and delete old one
        c.criterionId = c.criterionid;
        delete c.criterionid;
      } else if (c.criterion_id !== undefined && c.criterionId === undefined) {
        c.criterionId = c.criterion_id;
        delete c.criterion_id;
      }

      if (c.type === undefined && c.operator !== undefined) {
        c.type = c.operator;
        delete c.operator;
      }

      if (c.value === undefined && c.val !== undefined) {
        c.value = c.val;
        delete c.val;
      }

      if (c.effect === undefined && c.effects !== undefined) {
        c.effect = c.effects;
        delete c.effects;
      }

      // ensure minimal shape so Question consumers don't see undefined keys
      if (c.criterionId === undefined) c.criterionId = '';
      if (c.type === undefined) c.type = '';
      if (c.value === undefined) c.value = '';
      if (c.effect === undefined) c.effect = '';
    }
  };

  private mapRowToQuestionPlain = (row: any): any => {
    const criteria = this.parseCriteriaInPlace(row.criteria);
    this.normalizeCriteriaKeysInPlace(criteria);

    // return a plain object shaped like a Question
    return {
      questionId: row.questionid,
      typeCode: row.typecode,
      questionText: row.questiontext,
      formId: row.formid,
      interviewId: row.interviewid,
      criteria: criteria,
    };
  };

  async getAllByFormId(formId: string) {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query(
      'SELECT * FROM get_questions_by_form($1, $2)',
      [currentUserId, formId]
    );

    return result.rows.map(this.mapRowToQuestionPlain);
  }

  async getAllByInterviewId(interviewId: string): Promise<Question[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    const result = await pool.query(
      'SELECT * FROM get_questions_by_interview_id($1::uuid, $2::uuid)',
      [currentUserId, interviewId]
    );
    return result.rows.map(this.mapRowToQuestion);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Question ID is required');

    await pool.query('CALL delete_question($1, $2)', [currentUserId, id]);
  }

  private mapRowToQuestion = (row: any): Question => {
    return new Question(
      row.typecode,
      row.questiontext, // Now receives string directly
      row.formid,
      row.interviewid,
      row.questionid
    );
  };
}

const questionMapper = new QuestionMapper();
export default questionMapper;
