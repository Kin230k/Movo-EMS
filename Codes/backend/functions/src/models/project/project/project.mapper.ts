import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Project } from './project.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class ProjectMapper extends BaseMapper<Project> {
  async save(entity: Project): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

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

    // Validation
    if (!name) throw new Error('Project name is required');
    if (!startingDate) throw new Error('Starting date is required');

    if (op === Operation.UPDATE) {
      if (!projectId) throw new Error('Project ID is required for update');

      // Normal user update (must be owner)
      await pool.query(
        'CALL update_project_if_owner($1, $2, $3, $4, $5, $6, $7)',
        [
          currentUserId,
          projectId,
          name,
          badgeBackground,
          startingDate,
          endingDate,
          description,
        ]
      );
    } else {
      if (!clientId) throw new Error('Client ID is required');
      await pool.query('CALL create_project($1, $2, $3, $4, $5, $6, $7)', [
        currentUserId,
        clientId,
        name,
        badgeBackground,
        startingDate,
        endingDate,
        description,
      ]);
    }
  }

  // 👇 New method for admin-level updates
  async updateAsAdmin(entity: Project): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const {
      projectId,
      name,
      badgeBackground,
      startingDate,
      endingDate,
      description,
    } = entity;

    if (!projectId) throw new Error('Project ID is required for admin update');

    await pool.query('CALL update_project($1, $2, $3, $4, $5, $6, $7)', [
      currentUserId,
      projectId,
      name,
      badgeBackground,
      startingDate,
      endingDate,
      description,
    ]);
  }

  async getById(id: string): Promise<Project | null> {
    if (!id) throw new Error('Project ID is required');
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_project_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Project[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_projects($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEntity);
  }

  async getAllActive(): Promise<Project[]> {
    const result = await pool.query('SELECT * FROM get_active_projects()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Project ID is required');

    await pool.query('CALL delete_project($1, $2)', [currentUserId, id]);
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
