import type { QueryResult } from 'pg';
import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { User } from './user.class';
import pool from '../../../utils/pool';
import { Multilingual } from '../../multilingual.type';
import { CurrentUser } from '../../../utils/currentUser.class';
export interface ProjectUser {
  userId: string;
  name: Multilingual;
  email: string | null;
  phone: string | null;
  picture: string | null;
  role: string;
  status: string;
  hourlyRate: number | null;
}
export class UserMapper extends BaseMapper<User> {
  /**
   * Change a user's email
   */
  static async changeEmail(uid: string, email: string): Promise<QueryResult> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!uid) throw new Error('User ID is required for update');
    if (!email) throw new Error('Email is required for update');

    return pool.query('CALL edit_user_email($1, $2, $3)', [
      currentUserId,
      uid,
      email,
    ]);
  }

  static async changePhone(uid: string, phone: string): Promise<QueryResult> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!uid) throw new Error('User ID is required for update');
    if (!phone) throw new Error('Phone is required for update');

    return pool.query('CALL edit_user_phone($1, $2, $3)', [
      currentUserId,
      uid,
      phone,
    ]);
  }

  static async editUserInfo(
    uid: string,
    name: Multilingual,
    picture?: string
  ): Promise<QueryResult> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!uid) throw new Error('User ID is required for update');
    if (!name || Object.keys(name).length === 0)
      throw new Error('Name is required for update');
    return pool.query('CALL edit_user_info($1, $2, $3, $4)', [
      currentUserId,
      uid,
      name,
      picture ?? null,
    ]);
  }

  /**
   * save() infers create vs update from User.operation getter.
   */
  async save(user: User): Promise<void> {
    const op = user.operation;
    const { userId, name, email, phone, picture, role, status, twoFaEnabled } =
      user;

    if (op === Operation.UPDATE) {
      const currentUserId = CurrentUser.uuid;
      if (!currentUserId) throw new Error('Current user UUID is not set');
      if (!userId) throw new Error('User ID is required for update');
      await pool.query('CALL update_user($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
        currentUserId,
        userId,
        name,
        email,
        phone,
        picture,
        role,
        status,
        twoFaEnabled,
      ]);
    } else {
      await pool.query('CALL create_user($1, $2, $3, $4, $5, $6, $7, $8)', [
        userId,
        name,
        email,
        phone,
        picture,
        role,
        status,
        twoFaEnabled,
      ]);
    }
  }

  async getById(userId: string): Promise<User | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_user_by_id($1, $2)',
      [currentUserId, userId]
    );
    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }

  async getAll(): Promise<User[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_users($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToUser);
  }

  async delete(userId: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    await pool.query('CALL delete_user($1, $2)', [currentUserId, userId]);
  }

  async getByEmail(email: string): Promise<User | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_user_by_email($1, $2)',
      [currentUserId, email]
    );

    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }
    async getByForm(formId: string): Promise<User | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_user_by_form($1, $2)',
      [currentUserId, formId]
    );

    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }
  async getUserRoleById(userId: string): Promise<string | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!userId) throw new Error('User ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_user_role_by_id($1, $2)',
      [currentUserId, userId]
    );

    if (!result.rows.length) return null;
    const row = result.rows[0] as any;
    return row.role as string;
  }
  async getProjectUsers(projectId: string): Promise<ProjectUser[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!projectId) throw new Error('projectId is required');
    const result = await pool.query('SELECT * FROM get_project_users($1, $2)', [
      currentUserId,
      projectId,
    ]);

    return result.rows.map((row: any) => this.mapRowToProjectUser(row));
  }
  async getUsersSalary(year?: number, month?: number): Promise<number> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    // Default to current month/year if not provided
    const currentDate = new Date();
    const calculationYear = year || currentDate.getFullYear();
    const calculationMonth = month || currentDate.getMonth() + 1;

    const result: QueryResult = await pool.query(
      'SELECT calculate_monthly_salary($1, $2) AS salary',
      [calculationYear, calculationMonth]
    );

    if (!result.rows.length) throw new Error('Failed to calculate salary');

    return parseInt(result.rows[0].salary);
  }
  private mapRowToUser = (row: any): User => {
    return new User(
      row.name,
      row.email,
      row.phone,
      row.role,
      row.status,
      row.twofaenabled,
      row.picture,
      row.Operation,
      row.userid
    );
  };

  private mapRowToProjectUser = (row: any): ProjectUser => {
    return {
      userId: row.userid,
      name: row.name,
      email: row.email ?? null,
      phone: row.phone ?? null,
      picture: row.picture ?? null,
      role: row.role,
      status: row.status,
      hourlyRate:
        row.hourlyrate !== null && row.hourlyrate !== undefined
          ? parseFloat(row.hourlyrate)
          : null,
    };
  };
}

const userMapper = new UserMapper();
export default userMapper;
