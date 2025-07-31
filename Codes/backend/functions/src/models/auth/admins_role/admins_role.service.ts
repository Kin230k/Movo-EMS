import adminsRoleMapper from './admins_role.mapper';
import { AdminsRole } from './admins_role.class';

export class AdminsRoleService {
  constructor() {}

  static async createAdminsRole(
    adminId: string,
    roleId: string
  ): Promise<void> {
    const entity = new AdminsRole(adminId, roleId);
    await adminsRoleMapper.save(entity);
  }

  static async updateAdminsRole(
    adminRoleId: string,
    adminId: string,
    roleId: string
  ): Promise<void> {
    const entity = new AdminsRole(adminId, roleId, adminRoleId);
    await adminsRoleMapper.save(entity);
  }

  static async getAdminsRoleById(id: string): Promise<AdminsRole | null> {
    return await adminsRoleMapper.getById(id);
  }

  static async getAllAdminsRoles(): Promise<AdminsRole[]> {
    return await adminsRoleMapper.getAll();
  }

  static async deleteAdminsRole(id: string): Promise<void> {
    await adminsRoleMapper.delete(id);
  }
}
