import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Option } from './option.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class OptionMapper extends BaseMapper<Option> {
  async save(entity: Option): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { optionId, optionText, questionId, isCorrect, displayOrder } =
      entity;

    if (!optionText) throw new Error('Option text is required');
    if (!questionId) throw new Error('Question ID is required');
    if (isCorrect === undefined || isCorrect === null)
      throw new Error('isCorrect flag is required');
    if (displayOrder === undefined || displayOrder === null)
      throw new Error('Display order is required');

    if (op === Operation.UPDATE) {
      if (!optionId) throw new Error('Option ID is required for update');
      await pool.query('CALL update_option($1, $2, $3, $4, $5, $6)', [
        currentUserId,
        optionId,
        optionText,
        questionId,
        isCorrect,
        displayOrder,
      ]);
    } else {
      await pool.query('CALL create_option($1, $2, $3, $4, $5)', [
        currentUserId,
        optionText,
        questionId,
        isCorrect,
        displayOrder,
      ]);
      
    }
  }

  async getById(id: string): Promise<Option | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Option ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_option_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToOption(result.rows[0]) : null;
  }

  async getAll(): Promise<Option[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_options($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToOption);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Option ID is required');

    await pool.query('CALL delete_option($1, $2)', [currentUserId, id]);
  }

  private mapRowToOption = (row: any): Option => {
    return new Option(
      row.optionText,
      row.questionId,
      row.isCorrect,
      row.displayOrder,
      row.optionId
    );
  };
}

const optionMapper = new OptionMapper();
export default optionMapper;
