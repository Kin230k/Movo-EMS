import { RoleMapper } from '../../models/auth/role/role.mapper';
import { Role } from '../../models/auth/role/role.class';
import { Operation } from '../../models/operation.enum';

export class RoleService {
  constructor(private readonly mapper: RoleMapper) {}

  async createRole(
    name: string, description?: string | null
  ): Promise<void> {
    const entity = new Role(
      name,
      undefined,
      description
    );
    await this.mapper.save(entity);
  }

  async updateRole(
    roleId: string, name: string, description: string | null
  ): Promise<void> {
    const entity = new Role(
      name,
      roleId,
      description
    );
    await this.mapper.save(entity);
  }

  async getRoleById(id: string): Promise<Role | null> {
    return await this.mapper.getById(id);
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.mapper.getAll();
  }

  async deleteRole(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}