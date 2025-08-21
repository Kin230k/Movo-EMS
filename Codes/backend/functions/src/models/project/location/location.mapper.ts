import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Location } from './location.class';
import type { QueryResult } from 'pg';
import { pool } from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class LocationMapper extends BaseMapper<Location> {
  async save(entity: Location): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { locationId, name, projectId, siteMap, longitude, latitude } =
      entity;

    // Validation
    if (!name) throw new Error('Location name is required');
    if (!projectId) throw new Error('Project ID is required');
    if (longitude == null || latitude == null)
      throw new Error('Longitude and latitude are required');

    if (op === Operation.UPDATE) {
      if (!locationId) throw new Error('Location ID is required for update');
      await pool.query('CALL update_location($1, $2, $3, $4, $5, $6, $7)', [
        currentUserId,
        locationId,
        name,
        projectId,
        siteMap,
        longitude,
        latitude,
      ]);
    } else {
      const { rows } = await pool.query(
        'SELECT * FROM create_location($1, $2, $3, $4, $5, $6)',
        [currentUserId, name, projectId, siteMap, longitude, latitude]
      );

      if (rows.length === 0) throw new Error('Failed to create location');
      entity.locationId = rows[0].locationId;
    }
  }

  async getById(id: string): Promise<Location | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Location ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_location_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Location[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_locations($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Location ID is required');

    await pool.query('CALL delete_location($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): Location => {
    return new Location(
      row.name,
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
