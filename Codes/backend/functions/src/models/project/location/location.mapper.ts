import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Location } from './location.class';
import type { QueryResult } from 'pg';
import { pool } from '../../../utils/pool';

export class LocationMapper extends BaseMapper<Location> {
  async save(entity: Location): Promise<void> {
    const op = entity.operation;
    const { locationId, name, projectId, siteMap, longitude, latitude } =
      entity;

    if (op === Operation.UPDATE) {
      if (!entity.locationId)
        throw new Error('Location ID is required for update');
      await pool.query('CALL update_location($1, $2, $3, $4, $5, $6)', [
        locationId,
        name,
        projectId,
        siteMap,
        longitude,
        latitude,
      ]);
    } else {
      await pool.query('CALL create_location($1, $2, $3, $4, $5)', [
        name,
        projectId,
        siteMap,
        longitude,
        latitude,
      ]);
    }
  }

  async getById(id: string): Promise<Location | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_location_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Location[]> {
    const result = await pool.query('SELECT * FROM get_all_locations()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_location($1)', [id]);
  }

  private mapRowToEntity = (row: any): Location => {
    return new Location(
      row.name, // JSONB object
      row.projectId,
      row.locationId,
      row.siteMap,
      row.longitude,
      row.latitude
    );
  };
}
const locationMapper = new LocationMapper();
export default locationMapper;
