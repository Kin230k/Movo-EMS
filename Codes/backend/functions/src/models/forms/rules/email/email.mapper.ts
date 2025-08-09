import { Operation } from '../../../operation.enum';
import { BaseMapper } from '../../../base-mapper';
import { Email } from './email.class';
import type { QueryResult } from 'pg';
import pool from '../../../../utils/pool';

export class EmailMapper extends BaseMapper<Email> {
  constructor() {
    super(pool);
  }

  async save(entity: Email): Promise<void> {
    const op = entity.operation;
    const { emailId, title, body, formId } = entity;

    if (op === Operation.UPDATE) {
      if (!emailId) throw new Error('Email ID required for update');
      await this.pool.query(
        'CALL update_email($1, $2, $3, $4)',
        [emailId, title, body, formId]
      );
    } else {
      await this.pool.query(
        'CALL create_email($1, $2, $3)',
        [title, body, formId]
      );
    }
  }

  async getById(id: string): Promise<Email | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_email_by_id($1)',
      [id]
    );
    return result.rows.length ? new Email(
      result.rows[0].title,
      result.rows[0].body,
      result.rows[0].formId,
      result.rows[0].emailId
    ) : null;
  }

  async getAll(): Promise<Email[]> {
    const result = await this.pool.query('SELECT * FROM get_all_emails()');
    return result.rows.map(row => new Email(
      row.title,
      row.body,
      row.formId,
      row.emailId
    ));
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_email($1)', [id]);
  }
}

const emailMapper = new EmailMapper();
export default emailMapper;
