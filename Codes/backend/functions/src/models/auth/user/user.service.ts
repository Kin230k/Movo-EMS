import userMapper from './user.mapper';
import { User } from './user.class';
import { Multilingual } from '../../multilingual.type';
import { UserStatus } from './user_status.enum';

export class UserService {
  constructor() {}

  static async registerUser(
    name: Multilingual,
    email: string,
    phone: string,
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
      userId
    );

    await userMapper.save(user);
  }

  static async updateUser(
    userId: string,
    name: Multilingual,
    email: string,
    phone: string,
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
      userId
    );

    await userMapper.save(user);
  }

  static async getUserById(userId: string): Promise<User | null> {
    console.log(userId);
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
}
