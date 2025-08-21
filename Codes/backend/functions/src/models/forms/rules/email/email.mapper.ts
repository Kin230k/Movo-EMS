import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Email } from './email.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';
import { CurrentUser } from '../../../../utils/currentUser.class';

export class EmailMapper extends BaseMapper<Email> {
  async save(entity: Email): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { emailId, title, body, formId } = entity;

    if (!title) throw new Error('Email title is required');
    if (!body) throw new Error('Email body is required');
    if (!formId) throw new Error('Form ID is required');

    if (op === Operation.UPDATE) {
      if (!emailId) throw new Error('Email ID is required for update');
      await pool.query('CALL update_email($1, $2, $3, $4, $5)', [
        currentUserId,
        emailId,
        title,
        body,
        formId,
      ]);
    } else {
      await pool.query('CALL create_email($1, $2, $3, $4)', [
        currentUserId,
        title,
        body,
        formId,
      ]);
    }
  }

  async getById(id: string): Promise<Email | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Email ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_email_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEmail(result.rows[0]) : null;
  }

  async getAll(): Promise<Email[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_emails($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEmail);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Email ID is required');

    await pool.query('CALL delete_email($1, $2)', [currentUserId, id]);
  }

  private mapRowToEmail = (row: any): Email => {
    return new Email(row.title, row.body, row.formId, row.emailId);
  };
}

const emailMapper = new EmailMapper();
export default emailMapper;
