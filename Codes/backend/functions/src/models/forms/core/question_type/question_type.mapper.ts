import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { QuestionType } from './question_type.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class QuestionTypeMapper extends BaseMapper<QuestionType> {
  async save(entity: QuestionType): Promise<void> {
    const op = entity.operation;
    const { typeCode, description } = entity;

    if (op === Operation.UPDATE) {
      if (!typeCode) throw new Error('QuestionType ID required for update');
      await pool.query('CALL update_question_type($1, $2)', [
        typeCode,
        description,
      ]);
    } else {
      await pool.query('CALL create_question_type($1)', [description]);
    }
  }

  async getById(id: string): Promise<QuestionType | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_question_type_by_id($1)',
      [id]
    );
    return result.rows.length
      ? new QuestionType(result.rows[0].description, result.rows[0].typeCode)
      : null;
  }

  async getAll(): Promise<QuestionType[]> {
    const result = await pool.query('SELECT * FROM get_all_question_types()');
    return result.rows.map(
      (row) => new QuestionType(row.description, row.typeCode)
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_question_type($1)', [id]);
  }
}

const questiontypeMapper = new QuestionTypeMapper();
export default questiontypeMapper;
