import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Area } from './area.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';

export class AreaMapper extends BaseMapper<Area> {
  async save(entity: Area): Promise<void> {
    const op = entity.operation;
    const { areaId, name, locationId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.areaId) throw new Error('Area ID is required for update');
      await pool.query('CALL update_area($1, $2, $3)', [
        areaId,
        name,
        locationId,
      ]);
    } else {
      await pool.query('CALL create_area($1, $2)', [name, locationId]);
    }
  }

  async getById(id: string): Promise<Area | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_area_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Area[]> {
    const result = await pool.query('SELECT * FROM get_all_areas()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_area($1)', [id]);
  }

  private mapRowToEntity = (row: any): Area => {
    return new Area(row.name, row.locationId, row.areaId);
  };
}
const areaMapper = new AreaMapper();
export default areaMapper;
