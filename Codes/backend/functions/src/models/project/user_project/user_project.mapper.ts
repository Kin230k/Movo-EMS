import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { UserProject } from './user_project.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { CurrentUser } from '../../../utils/currentUser.class';

export class UserProjectMapper extends BaseMapper<UserProject> {
  async save(entity: UserProject): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const { userProjectId, userId, projectId } = entity;

    // Validation
    if (!userId) throw new Error('User ID is required');
    if (!projectId) throw new Error('Project ID is required');

    if (op === Operation.UPDATE) {
      if (!userProjectId) throw new Error('UserProject ID is required for update');
      await pool.query('CALL update_user_project($1, $2, $3, $4)', [
        currentUserId,
        userProjectId,
        userId,
        projectId,
      ]);
    } else {
      await pool.query('CALL create_user_project($1, $2, $3)', [
        currentUserId,
        userId,
        projectId,
      ]);
    }
  }

  async getById(id: string): Promise<UserProject | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('UserProject ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_user_project_by_id($1, $2)',
      [currentUserId, id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<UserProject[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_user_project($1)', [currentUserId]);
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('UserProject ID is required');

    await pool.query('CALL delete_user_project($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): UserProject => {
    return new UserProject(row.userId, row.projectId, row.userProjectId);
  };
}

const userProjectMapper = new UserProjectMapper();
export default userProjectMapper;
