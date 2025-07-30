import { AdminsRoleMapper } from '../../models/auth/admins_role/admins_role.mapper';
import { AdminsRole } from '../../models/auth/admins_role/admins_role.class';

export class AdminsRoleService {
  constructor(private readonly mapper: AdminsRoleMapper) {}

  async createAdminsRole(adminId: string, roleId: string): Promise<void> {
    const entity = new AdminsRole(adminId, roleId);
    await this.mapper.save(entity);
  }

  async updateAdminsRole(
    adminRoleId: string,
    adminId: string,
    roleId: string
  ): Promise<void> {
    const entity = new AdminsRole(adminId, roleId, adminRoleId);
    await this.mapper.save(entity);
  }

  async getAdminsRoleById(id: string): Promise<AdminsRole | null> {
    return await this.mapper.getById(id);
  }

  async getAllAdminsRoles(): Promise<AdminsRole[]> {
    return await this.mapper.getAll();
  }

  async deleteAdminsRole(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}
