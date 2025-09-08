import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Area } from './area.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class AreaMapper extends BaseMapper<Area> {
  async save(entity: Area): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { areaId, name, locationId } = entity;

    if (!name) throw new Error('Area name is required');
    if (!locationId) throw new Error('Location ID is required');

    if (op === Operation.UPDATE) {
      if (!areaId) throw new Error('Area ID is required for update');
      await pool.query('CALL update_area($1, $2, $3, $4)', [
        currentUserId,
        areaId,
        name,
        locationId,
      ]);
    } else {
      await pool.query('CALL create_area($1, $2, $3)', [
        currentUserId,
        name,
        locationId,
      ]);
    }
  }

  async getById(id: string): Promise<Area | null> {
    if (!id) throw new Error('Area ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_area_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Area[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_areas($1)', [currentUserId]);
    return result.rows.map(this.mapRowToEntity);
  }
  async getByLocation(locationId: string): Promise<Area[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!locationId) throw new Error('Location ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_areas_by_location($1, $2)',
      [currentUserId, locationId]
    );
    return result.rows.map(this.mapRowToEntity);
  }


  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Area ID is required');

    await pool.query('CALL delete_area($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): Area => {
    return new Area(row.name, row.locationid, row.areaid);
  };
}

const areaMapper = new AreaMapper();
export default areaMapper;
