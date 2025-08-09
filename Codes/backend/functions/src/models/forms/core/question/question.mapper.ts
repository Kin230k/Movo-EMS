import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Question } from './question.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class QuestionMapper extends BaseMapper<Question> {
  constructor() {
    super(pool);
  }

  async save(entity: Question): Promise<void> {
    const op = entity.operation;
    const { questionId, typeCode, questionText, formId, interviewId } = entity;

    if (op === Operation.UPDATE) {
      if (!questionId) throw new Error('Question ID required for update');
      await this.pool.query(
        'CALL update_question($1, $2, $3, $4, $5)',
        [questionId, typeCode, questionText, formId, interviewId]
      );
    } else {
      await this.pool.query(
        'CALL create_question($1, $2, $3, $4)',
        [typeCode, questionText, formId, interviewId]
      );
    }
  }

  async getById(id: string): Promise<Question | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_question_by_id($1)',
      [id]
    );
    return result.rows.length ? new Question(
      result.rows[0].typeCode,
      result.rows[0].questionText,
      result.rows[0].formId,
      result.rows[0].interviewId,
      result.rows[0].questionId
    ) : null;
  }

  async getAll(): Promise<Question[]> {
    const result = await this.pool.query('SELECT * FROM get_all_questions()');
    return result.rows.map(row => new Question(
      row.typeCode,
      row.questionText,
      row.formId,
      row.interviewId,
      row.questionId
    ));
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_question($1)', [id]);
  }
}

const questionMapper = new QuestionMapper();
export default questionMapper;
