import  roleMapper  from '../../models/auth/role/role.mapper';
import { Role } from '../../models/auth/role/role.class';
import { Multilingual } from '../../models/multilingual.type';

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
}
