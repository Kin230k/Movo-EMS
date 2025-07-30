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
      if (!locationId) {
        throw new Error('Location ID is required for update');
      }
      await pool.query('CALL update_location($1, $2, $3, $4, $5, $6)', [
        locationId,
        name,
        projectId,
        siteMap,
        longitude,
        latitude,
      ]);
    } else {
      // create_location is now a FUNCTION → use SELECT to get back the inserted row
      const { rows } = await pool.query(
        'SELECT * FROM create_location($1, $2, $3, $4, $5)',
        [name, projectId, siteMap, longitude, latitude]
      );

      if (rows.length === 0) {
        throw new Error('Failed to create location');
      }

      // assign the generated ID (and any other returned fields) back to our entity
      const created = rows[0];
      entity.locationId = created.locationid; // note: PG returns lowercase keys
      // if you need to sync other fields:
      // entity.name      = created.name;
      // entity.siteMap   = created.sitemap;
      // entity.longitude = created.longitude;
      // entity.latitude  = created.latitude;
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
