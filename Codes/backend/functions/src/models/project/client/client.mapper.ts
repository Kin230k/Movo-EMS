import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Client } from './client.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';
import { ClientStatus } from '../../client_status.enum';

export class ClientMapper extends BaseMapper<Client> {
  async save(entity: Client): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const {
      clientId,
      name,
      logo,
      company,
      contactEmail,
      contactPhone,
      status,
    } = entity;

    // Validation
    if (!name) throw new Error('Client name is required');

    if (op === Operation.UPDATE) {
      if (!clientId) throw new Error('Client ID is required for update');
      await pool.query('CALL update_client($1, $2, $3, $4, $5, $6, $7,$8)', [
        currentUserId,
        clientId,
        name,
        logo,
        company,
        contactEmail,
        contactPhone,
        status,
      ]);
    } else {
      await pool.query('CALL create_client($1, $2, $3, $4, $5, $6, $7, $8)', [
        currentUserId,
        clientId,
        name,
        logo,
        company,
        contactEmail,
        contactPhone,
        status,
      ]);
    }
  }

  async getById(id: string): Promise<Client | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Client ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_client_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Client[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_clients($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Client ID is required');

    await pool.query('CALL delete_client($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): Client => {
    const client = new Client(
      row.name,
      row.contactemail,
      row.contactphone,
      row.company,
      row.clientid,
      row.logo,
      row.status as ClientStatus
    );
    client.operation = Operation.UPDATE;
    return client;
  };
}

const clientMapper = new ClientMapper();
export default clientMapper;
