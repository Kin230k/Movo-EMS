import roleMapper from './role.mapper';
import { Role } from './role.class';
import { Multilingual } from '../../multilingual.type';
import { UserService } from '../user/user.service';

export class RoleService {
  constructor() {}

  static async createRole(
    name: Multilingual,
    description?: Multilingual | null
  ): Promise<void> {
    const entity = new Role(name, undefined, description);
    await roleMapper.save(entity);
  }

  static async updateRole(
    roleId: string,
    name: Multilingual,
    description: Multilingual | null
  ): Promise<void> {
    const entity = new Role(name, roleId, description);
    await roleMapper.save(entity);
  }

  static async getRoleById(id: string): Promise<Role | null> {
    return await roleMapper.getById(id);
  }

  static async getAllRoles(): Promise<Role[]> {
    return await roleMapper.getAll();
  }

  static async deleteRole(id: string): Promise<void> {
    await roleMapper.delete(id);
  }

  // Convenience passthrough for callers who want just the role name from a userId
  static async getRoleByUserID(userId: string): Promise<string | null> {
    return await UserService.getUserRoleById(userId);
  }
  // role.service.ts
// Add this method to the RoleService class

static async getRoleIdByhName(roleName: string): Promise<string | null> {
  return await roleMapper.getRoleIdByName(roleName);
}
}
