import { UserMapper } from '../../models/auth/user/user.mapper';
import { User } from '../../models/auth/user/user.class';
import { Operation } from '../../models/operation.enum';
import { Multilingual } from '../../models/multilingual.type';

export class UserService {
  constructor(private readonly mapper: UserMapper) {}

  async registerUser(
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
      picture
    );
    

    await this.mapper.save(user);
  }

  async updateUser(
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
    

    await this.mapper.save(user);
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.mapper.getById(userId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.mapper.getByEmail(email);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.mapper.getAll();
  }

  async deleteUser(userId: string): Promise<void> {
    await this.mapper.delete(userId);
  }
}
