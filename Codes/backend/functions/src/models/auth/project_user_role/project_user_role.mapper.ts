import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { ProjectUserRole } from "./project_user_role.class";
import type { Pool, QueryResult } from 'pg';

export class ProjectUserRoleMapper extends BaseMapper<ProjectUserRole> {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entity: ProjectUserRole): Promise<void> {
    const op = entity.operation;
    const { projectUserRoleId, userId, projectId, roleId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.projectUserRoleId) throw new Error('ProjectUserRole ID is required for update');
      await this.pool.query(
        'CALL update_project_user_role($1, $2, $3, $4)',
        [projectUserRoleId, userId, projectId, roleId]
      );
    } else {
      await this.pool.query(
        'CALL create_project_user_role($1, $2, $3)',
        [userId, projectId, roleId]
      );
    }
  }

  async getById(id: string): Promise<ProjectUserRole | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_project_user_role_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<ProjectUserRole[]> {
    const result = await this.pool.query('SELECT * FROM get_all_project_user_roles()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('CALL delete_project_user_role($1)', [id]);
  }

  private mapRowToEntity = (row: any): ProjectUserRole => {
    return new ProjectUserRole(
      row.userId,
      row.projectId,
      row.roleId,
      row.projectUserRoleId
    );
  };
}