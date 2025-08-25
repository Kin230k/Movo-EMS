import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { QuestionType } from './question_type.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class QuestionTypeMapper extends BaseMapper<QuestionType> {
  async save(entity: QuestionType): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { typeCode, description } = entity;

    if (!description) throw new Error('Description is required');

    if (op === Operation.UPDATE) {
      if (!typeCode) throw new Error('QuestionType ID is required for update');
      await pool.query('CALL update_question_type($1, $2, $3)', [
        currentUserId,
        typeCode,
        description,
      ]);
    } else {
      await pool.query('CALL create_question_type($1, $2)', [
        currentUserId,
        description,
      ]);
    }
  }

  async getById(id: string): Promise<QuestionType | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('QuestionType ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_question_type_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length
      ? this.mapRowToQuestionType(result.rows[0])
      : null;
  }

  async getAll(): Promise<QuestionType[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query(
      'SELECT * FROM get_all_question_types($1)',
      [currentUserId]
    );
    return result.rows.map(this.mapRowToQuestionType);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('QuestionType ID is required');

    await pool.query('CALL delete_question_type($1, $2)', [currentUserId, id]);
  }

  private mapRowToQuestionType = (row: any): QuestionType => {
    return new QuestionType(row.description, row.typeCode);
  };
}

const questionTypeMapper = new QuestionTypeMapper();
export default questionTypeMapper;
