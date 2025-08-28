import userMapper, { UserMapper,ProjectUser  } from './user.mapper';
import { User } from './user.class';
import { Multilingual } from '../../multilingual.type';
import { UserStatus } from './user_status.enum';
import type { QueryResult } from 'pg';
import { Operation } from '../../operation.enum';

export class UserService {
  constructor() {}

  static async registerUser(
    name: Multilingual,
    email: string | undefined,
    phone: string | undefined,
    role: string,
    status: string,
    twoFaEnabled: boolean,
    userId: string,
    picture?: string
  ): Promise<void> {
    const user = new User(
      name,
      email,
      phone,
      role,
      status,
      twoFaEnabled,
      picture,
      Operation.CREATE,
      userId
    );

    await userMapper.save(user);
  }

  static async updateUser(
    userId: string,
    name: Multilingual,
    email: string | undefined,
    phone: string | undefined,
    role: string,
    status: string,
    twoFaEnabled: boolean,
    picture?: string
  ): Promise<void> {
    const user = new User(
      name,
      email,
      phone,
      role,
      status,
      twoFaEnabled,
      picture,
      Operation.UPDATE,
      userId
    );

    await userMapper.save(user);
  }
  static async changeEmail(
    userId: string,
    email: string
  ): Promise<QueryResult> {
    return await UserMapper.changeEmail(userId, email);
  }
  static async changePhone(
    userId: string,
    phone: string
  ): Promise<QueryResult> {
    return await UserMapper.changePhone(userId, phone);
  }

  static async editUserInfo(
    userId: string,
    name: Multilingual,
    picture?: string
  ) {
   return await UserMapper.editUserInfo(userId, name, picture);
  }

  static async getUserById(userId: string): Promise<User | null> {
    return await userMapper.getById(userId);
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return await userMapper.getByEmail(email);
  }

  static async getAllUsers(): Promise<User[]> {
    return await userMapper.getAll();
  }

  static async deleteUser(userId: string): Promise<void> {
    await userMapper.delete(userId);
  }
  static async isUserActive(user: User): Promise<boolean> {
    return user?.getStatus === UserStatus.Active;
  }
    static async getProjectUsers(projectId: string): Promise<ProjectUser[]> {
    return await userMapper.getProjectUsers(projectId);
  }

}
