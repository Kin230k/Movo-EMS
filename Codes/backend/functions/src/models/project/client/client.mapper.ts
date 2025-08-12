import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Client } from './client.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { ClientStatus } from '../../client_status.enum';
export class ClientMapper extends BaseMapper<Client> {
  async save(entity: Client): Promise<void> {
    const op = entity.operation;
    const {
      clientId,
      name,
      logo,
      company,
      contactEmail,
      contactPhone,
      status,
      userId,
    } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.clientId) throw new Error('Client ID is required for update');
      await pool.query('CALL update_client($1, $2, $3, $4, $5, $6, $7, $8)', [
        clientId,
        name,
        logo,
        company,
        contactEmail,
        contactPhone,
        status,
        userId,
      ]);
    } else {
      await pool.query('CALL create_client($1, $2, $3, $4, $5, $6, $7)', [
        name,
        logo,
        company,
        contactEmail,
        contactPhone,
        status,
        userId,
      ]);
    }
  }

  async getById(id: string): Promise<Client | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_client_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Client[]> {
    const result = await pool.query('SELECT * FROM get_all_clients()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_client($1)', [id]);
  }

  private mapRowToEntity = (row: any): Client => {
    return new Client(
      row.name,
      row.contactemail,
      row.contactphone,
      row.clientid,
      row.logo,
      row.company,
      row.status as ClientStatus,
      row.userid
    );
  };
}

const clientMapper = new ClientMapper();
export default clientMapper;
