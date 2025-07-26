import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { Project } from "./project.class";
import type { Pool, QueryResult } from 'pg';

export class ProjectMapper extends BaseMapper<Project> {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entity: Project): Promise<void> {
    const op = entity.operation;
    const { projectId, clientId, name, badgeBackground, startingDate, endingDate, description } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.projectId) throw new Error('Project ID is required for update');
      await this.pool.query(
        'CALL update_project($1, $2, $3, $4, $5, $6, $7)',
        [projectId, clientId, name, badgeBackground, startingDate, endingDate, description]
      );
    } else {
      await this.pool.query(
        'CALL create_project($1, $2, $3, $4, $5, $6)',
        [clientId, name, badgeBackground, startingDate, endingDate, description]
      );
    }
  }

  async getById(id: string): Promise<Project | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_project_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<Project[]> {
    const result = await this.pool.query('SELECT * FROM get_all_projects()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_project($1)', [id]);
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