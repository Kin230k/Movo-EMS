import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { Client } from "./client.class";
import type { Pool, QueryResult } from 'pg';

export class ClientMapper extends BaseMapper<Client> {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entity: Client): Promise<void> {
    const op = entity.operation;
    const { clientId, name, logo, company, contactEmail, contactPhone } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.clientId) throw new Error('Client ID is required for update');
      await this.pool.query(
        'CALL update_client($1, $2, $3, $4, $5, $6)',
        [clientId, name, logo, company, contactEmail, contactPhone]
      );
    } else {
      await this.pool.query(
        'CALL create_client($1, $2, $3, $4, $5)',
        [name, logo, company, contactEmail, contactPhone]
      );
    }
  }

  async getById(id: string): Promise<Client | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_client_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Client[]> {
    const result = await this.pool.query('SELECT * FROM get_all_clients()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_client($1)', [id]);
  }

  private mapRowToEntity = (row: any): Client => {
    return new Client(
      row.name,
      row.contactEmail,
      row.contactPhone,
      row.clientId,
      row.logo,
      row.company
    );
  };
}