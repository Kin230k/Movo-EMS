import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { ProjectUserRole } from './project_user_role.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class ProjectUserRoleMapper extends BaseMapper<ProjectUserRole> {
  async save(entity: ProjectUserRole): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { projectUserRoleId, userId, projectId, roleId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.projectUserRoleId)
        throw new Error('ProjectUserRole ID is required for update');
      await pool.query('CALL update_project_user_role($1, $2, $3, $4, $5)', [
        currentUserId,
        projectUserRoleId,
        userId,
        projectId,
        roleId,
      ]);
    } else {
      await pool.query('CALL create_project_user_role($1, $2, $3, $4)', [
        currentUserId,
        userId,
        projectId,
        roleId,
      ]);
    }
  }

  async getById(id: string): Promise<ProjectUserRole | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_project_user_role_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<ProjectUserRole[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query(
      'SELECT * FROM get_all_project_user_roles($1)',
      [currentUserId]
    );
    return result.rows.map(this.mapRowToEntity);
  }

  async getByUserAndProject(
    userId: string,
    projectId: string
  ): Promise<ProjectUserRole[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_project_user_roles_by_user_and_project($1, $2, $3)',
      [currentUserId, userId, projectId]
    );

    return result.rows.map(this.mapRowToEntity);
  }

  async getProjectUserRoleByUser(
    userId: string
  ): Promise<ProjectUserRole | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_project_user_role_by_user($1)',
      [userId]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    await pool.query('CALL delete_project_user_role($1, $2)', [
      currentUserId,
      id,
    ]);
  }
  async deleteByUserAndProject(
    projectId: string,
    userId: string
  ): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    await pool.query(
      'CALL delete_project_user_role_by_user_project($1, $2,$3)',
      [currentUserId, projectId, userId]
    );
  }

  private mapRowToEntity = (row: any): ProjectUserRole => {
      const createdAt =
      row.createdat instanceof Date
        ? row.createdat.toISOString()
        : row.createdat !== null && row.createdat !== undefined
        ? String(row.createdat)
        : undefined;

    const updatedAt =
      row.updatedat instanceof Date
        ? row.updatedat.toISOString()
        : row.updatedat !== null && row.updatedat !== undefined
        ? String(row.updatedat)
        : undefined;

    return new ProjectUserRole(
      row.userid,
      row.projectid,
      row.roleid,
      row.projectuserroleid,
      createdAt as string,
      updatedAt as string
      
    );
  };
}
const projectUserRoleMapper = new ProjectUserRoleMapper();
export default projectUserRoleMapper;
