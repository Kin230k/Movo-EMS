import { ProjectUserRoleMapper } from '../../models/auth/project_user_role/project_user_role.mapper';
import { ProjectUserRole } from '../../models/auth/project_user_role/project_user_role.class';
import { Operation } from '../../models/operation.enum';

export class ProjectUserRoleService {
  constructor(private readonly mapper: ProjectUserRoleMapper) {}

  async createProjectUserRole(
    userId: string, projectId: string, roleId: string
  ): Promise<void> {
    const entity = new ProjectUserRole(
      userId,
      projectId,
      roleId
    );
    await this.mapper.save(entity);
  }

  async updateProjectUserRole(
    projectUserRoleId: string, 
    userId: string, 
    projectId: string, 
    roleId: string
  ): Promise<void> {
    const entity = new ProjectUserRole(
      userId,
      projectId,
      roleId,
      projectUserRoleId
    );
    await this.mapper.save(entity);
  }

  async getProjectUserRoleById(id: string): Promise<ProjectUserRole | null> {
    return await this.mapper.getById(id);
  }

  async getAllProjectUserRoles(): Promise<ProjectUserRole[]> {
    return await this.mapper.getAll();
  }

  async deleteProjectUserRole(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}