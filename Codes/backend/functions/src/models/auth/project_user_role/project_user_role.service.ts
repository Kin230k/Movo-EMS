import projectUserRoleMapper from './project_user_role.mapper';
import { ProjectUserRole } from './project_user_role.class';

export class ProjectUserRoleService {
  constructor() {}

  static async createProjectUserRole(
    userId: string,
    projectId: string,
    roleId: string
  ): Promise<void> {
    const entity = new ProjectUserRole(userId, projectId, roleId);
    await projectUserRoleMapper.save(entity);
  }

  static async updateProjectUserRole(
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
    await projectUserRoleMapper.save(entity);
  }

  static async getProjectUserRoleById(
    id: string
  ): Promise<ProjectUserRole | null> {
    return await projectUserRoleMapper.getById(id);
  }

  static async getAllProjectUserRoles(): Promise<ProjectUserRole[]> {
    return await projectUserRoleMapper.getAll();
  }

  static async deleteProjectUserRole(id: string): Promise<void> {
    await projectUserRoleMapper.delete(id);
  }
  static async getProjectUserRolesByUserAndProject(userId: string, projectId: string): Promise<ProjectUserRole[]> {
  return await projectUserRoleMapper.getByUserAndProject(userId, projectId);
}

}
