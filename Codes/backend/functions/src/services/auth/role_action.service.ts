import  roleActionMapper  from '../../models/auth/role_action/role_action.mapper';
import { RoleAction } from '../../models/auth/role_action/role_action.class';

export class RoleActionService {
  constructor() {}

  static async createRoleAction(roleId: string, actionId: string): Promise<void> {
    const entity = new RoleAction(roleId, actionId);
    await roleActionMapper.save(entity);
  }

 static async updateRoleAction(
    roleActionsId: string,
    roleId: string,
    actionId: string
  ): Promise<void> {
    const entity = new RoleAction(roleId, actionId, roleActionsId);
    await roleActionMapper.save(entity);
  }

 static async getRoleActionById(id: string): Promise<RoleAction | null> {
    return await roleActionMapper.getById(id);
  }

 static async getAllRoleActions(): Promise<RoleAction[]> {
    return await roleActionMapper.getAll();
  }

  static async deleteRoleAction(id: string): Promise<void> {
    await roleActionMapper.delete(id);
  }
}
