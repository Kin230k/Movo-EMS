import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Form } from './form.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class FormMapper extends BaseMapper<Form> {
  async save(entity: Form): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { formId, projectId, locationId } = entity;

    if (!projectId) throw new Error('Project ID is required');
    if (!locationId) throw new Error('Location ID is required');

    if (op === Operation.UPDATE) {
      if (!formId) throw new Error('Form ID is required for update');
      await pool.query('CALL update_form($1, $2, $3, $4)', [
        currentUserId,
        formId,
        projectId,
        locationId,
      ]);
    } else {
      await pool.query('CALL create_form($1, $2, $3)', [
        currentUserId,
        projectId,
        locationId,
      ]);
    }
  }

  async getById(id: string): Promise<Form | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Form ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_form_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToForm(result.rows[0]) : null;
  }

  async getAll(): Promise<Form[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_forms($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToForm);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Form ID is required');

    await pool.query('CALL delete_form($1, $2)', [currentUserId, id]);
  }

  private mapRowToForm = (row: any): Form => {
    return new Form(row.projectId, row.locationId, row.formId);
  };
}

const formMapper = new FormMapper();
export default formMapper;
