import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { UserProject } from './user_project.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';

export class UserProjectMapper extends BaseMapper<UserProject> {
  async save(entity: UserProject): Promise<void> {
    const op = entity.operation;
    const { userProjectId, userId, projectId } = entity;

    if (op === Operation.UPDATE) {
      if (!entity.userProjectId)
        throw new Error('UserProject ID is required for update');
      await pool.query('CALL update_user_project($1, $2, $3)', [
        userProjectId,
        userId,
        projectId,
      ]);
    } else {
      await pool.query('CALL create_user_project($1, $2)', [userId, projectId]);
    }
  }

  async getById(id: string): Promise<UserProject | null> {
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_user_project_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getAll(): Promise<UserProject[]> {
    const result = await pool.query('SELECT * FROM get_all_user_project()');
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    await pool.query('CALL delete_user_project($1)', [id]);
  }

  private mapRowToEntity = (row: any): UserProject => {
    return new UserProject(row.userId, row.projectId, row.userProjectId);
  };
}
const userProjectMapper = new UserProjectMapper();
export default userProjectMapper;
