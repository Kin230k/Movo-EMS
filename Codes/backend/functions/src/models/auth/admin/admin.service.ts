import adminMapper from './admin.mapper';
import { Admin } from './admin.class';
import { Multilingual } from '../../multilingual.type';
import { Operation } from '../../operation.enum';

export class AdminService {
  constructor() {}

  static async createAdmin(
    qid: string,
    name: Multilingual,
    uuid: string,
    dateOfBirth?: string | null,
    jobPosition?: string | null
  ): Promise<void> {
    const entity = new Admin(qid, name, uuid, dateOfBirth, jobPosition);
    await adminMapper.save(entity);
  }

  static async updateAdmin(
    adminId: string,
    qid: string,
    name: Multilingual,
    dateOfBirth: string | null,
    jobPosition: string | null
  ): Promise<void> {
    const entity = new Admin(qid, name, adminId, dateOfBirth, jobPosition);
    entity.operation = Operation.UPDATE;
    await adminMapper.save(entity);
  }

  static async getAdminById(id: string): Promise<Admin | null> {
    return await adminMapper.getById(id);
  }

  static async getAllAdmins(): Promise<Admin[]> {
    return await adminMapper.getAll();
  }

  static async deleteAdmin(id: string): Promise<void> {
    await adminMapper.delete(id);
  }
}
