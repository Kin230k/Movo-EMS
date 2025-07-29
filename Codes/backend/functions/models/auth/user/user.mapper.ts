import { Operation } from "../../operation.enum";
import { BaseMapper } from "../../base-mapper";
import { User } from "./user.class";
import type { Pool,QueryResult } from 'pg';

export class UserMapper extends BaseMapper<User> {
  constructor(pool: Pool) {
    super(pool);
  }

  /**
   * save() now infers create vs update from User.operation getter.
   */
  async save(user: User): Promise<void> {
     const op = user.operation;
    const {
      userId,
      name,
      email,
      phone,
      picture,
      role,
      status,
      twoFaEnabled,
    } = user;

    if (op === Operation.UPDATE) {
      if (!userId) throw new Error('User ID is required for update');
      await this.pool.query(
        'CALL update_user($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, name, email, phone, picture, role, status, twoFaEnabled]
      );
    } else {
      await this.pool.query(
        'CALL create_user($1, $2, $3, $4, $5, $6, $7)',
        [name, email, phone, picture, role, status, twoFaEnabled]
      );
    }
  }

  async getById(userId: string): Promise<User | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_user_by_id($1)',
      [userId]
    );
    return result.rows.length
      ? this.mapRowToUser(result.rows[0])
      : null;
  }

  async getAll(): Promise<User[]> {
    const result = await this.pool.query('SELECT * FROM get_all_users()');
    return result.rows.map(this.mapRowToUser);
  }

  async delete(userId: string): Promise<void> {
    await this.pool.query('CALL delete_user($1)', [userId]);
  }

  async getByEmail(email: string): Promise<User | null> {
    const result: QueryResult = await this.pool.query(
      'SELECT * FROM get_user_by_email($1)',
      [email]
    );
    return result.rows.length
      ? this.mapRowToUser(result.rows[0])
      : null;
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
      row.userid
    );
  };
}