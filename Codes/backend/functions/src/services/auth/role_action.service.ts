import { RoleActionMapper } from '../../models/auth/role_action/role_action.mapper';
import { RoleAction } from '../../models/auth/role_action/role_action.class';

export class RoleActionService {
  constructor(private readonly mapper: RoleActionMapper) {}

  async createRoleAction(roleId: string, actionId: string): Promise<void> {
    const entity = new RoleAction(roleId, actionId);
    await this.mapper.save(entity);
  }

  async updateRoleAction(
    roleActionsId: string,
    roleId: string,
    actionId: string
  ): Promise<void> {
    const entity = new RoleAction(roleId, actionId, roleActionsId);
    await this.mapper.save(entity);
  }

  async getRoleActionById(id: string): Promise<RoleAction | null> {
    return await this.mapper.getById(id);
  }

  async getAllRoleActions(): Promise<RoleAction[]> {
    return await this.mapper.getAll();
  }

  async deleteRoleAction(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}
