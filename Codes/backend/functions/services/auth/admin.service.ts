import { AdminMapper } from '../../models/auth/admin/admin.mapper';
import { Admin } from '../../models/auth/admin/admin.class';
import { Operation } from '../../models/operation.enum';

export class AdminService {
  constructor(private readonly mapper: AdminMapper) {}

  async createAdmin(
   qid: string, 
   firstName?: string | null, 
   lastName?: string | null, 
   dateOfBirth?: string | null, 
   jobPosition?: string | null
  ): Promise<void> {
    const entity = new Admin(
      qid,
      undefined,
      firstName,
      lastName,
      dateOfBirth,
      jobPosition
    );
    await this.mapper.save(entity);
  }

  async updateAdmin(
    adminId: string, 
    qid: string, 
    firstName: string | null, 
    lastName: string | null, 
    dateOfBirth: string | null, 
    jobPosition: string | null
  ): Promise<void> {
    const entity = new Admin(
      qid,
      adminId,
      firstName,
      lastName,
      dateOfBirth,
      jobPosition
    );
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