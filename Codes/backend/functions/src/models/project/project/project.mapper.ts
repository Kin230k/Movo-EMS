import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Project } from './project.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';

export class ProjectMapper extends BaseMapper<Project> {
  async save(entity: Project): Promise<void> {
    const op = entity.operation;
    const {
      projectId,
      clientId,
      name,
      badgeBackground,
      startingDate,
      endingDate,
      description,
    } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.projectId)
        throw new Error('Project ID is required for update');
      await pool.query('CALL update_project($1, $2, $3, $4, $5, $6, $7)', [
        projectId,
        clientId,
        name,
        badgeBackground,
        startingDate,
        endingDate,
        description,
      ]);
    } else {
      await pool.query('CALL create_project($1, $2, $3, $4, $5, $6)', [
        clientId,
        name,
        badgeBackground,
        startingDate,
        endingDate,
        description,
      ]);
    }
  }

  async getById(id: string): Promise<Project | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_project_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Project[]> {
    const result = await pool.query('SELECT * FROM get_all_projects()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_project($1)', [id]);
  }

  private mapRowToEntity = (row: any): Project => {
    return new Project(
      row.clientId,
      row.name,
      row.startingDate,
      row.projectId,
      row.badgeBackground,
      row.endingDate,
      row.description
    );
  };
}
const projectMapper = new ProjectMapper();
export default projectMapper;
