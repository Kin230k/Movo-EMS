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
    if (!formId) throw new Error('Form ID is required');
    if (!interviewId) throw new Error('Interview ID is required');

    if (op === Operation.UPDATE) {
      if (!questionId) throw new Error('Question ID is required for update');
      await pool.query('CALL update_question($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        questionId,
        typeCode,
        questionText,
        formId,
        interviewId,
      ]);
    } else {
      await pool.query('CALL create_question($1, $2, $3, $4, $5)', [
        currentUserId,
        typeCode,
        questionText,
        formId,
        interviewId,
      ]);
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
  async getAllByFormId(formId: string): Promise<Question[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query(
      'SELECT * FROM get_all_questions($1) WHERE formId = $2',
      [currentUserId, formId]
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
      row.typeCode,
      row.questionText,
      row.formId,
      row.interviewId,
      row.questionId
    );
  };
}

const questionMapper = new QuestionMapper();
export default questionMapper;
