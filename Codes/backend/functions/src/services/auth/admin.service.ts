import { AdminMapper } from '../../models/auth/admin/admin.mapper';
import { Admin } from '../../models/auth/admin/admin.class';
import { Multilingual } from '../../models/multilingual.type';

export class AdminService {
  constructor(private readonly mapper: AdminMapper) {}

  async createAdmin(
    qid: string,
    name: Multilingual,
    dateOfBirth?: string | null,
    jobPosition?: string | null
  ): Promise<void> {
    const entity = new Admin(qid, name, undefined, dateOfBirth, jobPosition);
    await this.mapper.save(entity);
  }

  async updateAdmin(
    adminId: string,
    qid: string,
    name: Multilingual,
    dateOfBirth: string | null,
    jobPosition: string | null
  ): Promise<void> {
    const entity = new Admin(qid, name, adminId, dateOfBirth, jobPosition);
    await this.mapper.save(entity);
  }

  async getAdminById(id: string): Promise<Admin | null> {
    return await this.mapper.getById(id);
  }

  async getAllAdmins(): Promise<Admin[]> {
    return await this.mapper.getAll();
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}
