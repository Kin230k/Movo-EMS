import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Option } from './option.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class OptionMapper extends BaseMapper<Option> {
  async save(entity: Option): Promise<void> {
    const op = entity.operation;
    const { optionId, optionText, questionId, isCorrect, displayOrder } =
      entity;

    if (op === Operation.UPDATE) {
      if (!optionId) throw new Error('Option ID required for update');
      await pool.query('CALL update_option($1, $2, $3, $4, $5)', [
        optionId,
        optionText,
        questionId,
        isCorrect,
        displayOrder,
      ]);
    } else {
      await pool.query('CALL create_option($1, $2, $3, $4)', [
        optionText,
        questionId,
        isCorrect,
        displayOrder,
      ]);
    }
  }

  async getById(id: string): Promise<Option | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_option_by_id($1)',
      [id]
    );
    return result.rows.length
      ? new Option(
          result.rows[0].optionText,
          result.rows[0].questionId,
          result.rows[0].isCorrect,
          result.rows[0].displayOrder,
          result.rows[0].optionId
        )
      : null;
  }

  async getAll(): Promise<Option[]> {
    const result = await pool.query('SELECT * FROM get_all_options()');
    return result.rows.map(
      (row) =>
        new Option(
          row.optionText,
          row.questionId,
          row.isCorrect,
          row.displayOrder,
          row.optionId
        )
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_option($1)', [id]);
  }
}

const optionMapper = new OptionMapper();
export default optionMapper;
