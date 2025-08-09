import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Form } from './form.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class FormMapper extends BaseMapper<Form> {
  async save(entity: Form): Promise<void> {
    const op = entity.operation;
    const { formId, projectId, locationId } = entity;

    if (op === Operation.UPDATE) {
      if (!formId) throw new Error('Form ID required for update');
      await pool.query('CALL update_form($1, $2, $3)', [
        formId,
        projectId,
        locationId,
      ]);
    } else {
      await pool.query('CALL create_form($1, $2)', [projectId, locationId]);
    }
  }

  async getById(id: string): Promise<Form | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_form_by_id($1)',
      [id]
    );
    return result.rows.length
      ? new Form(
          result.rows[0].projectId,
          result.rows[0].locationId,
          result.rows[0].formId
        )
      : null;
  }

  async getAll(): Promise<Form[]> {
    const result = await pool.query('SELECT * FROM get_all_forms()');
    return result.rows.map(
      (row) => new Form(row.projectId, row.locationId, row.formId)
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_form($1)', [id]);
  }
}

const formMapper = new FormMapper();
export default formMapper;
