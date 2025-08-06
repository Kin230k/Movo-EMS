import { UserProject } from './user_project.class';
import userProjectMapper from './user_project.mapper';

export class UserProjectService {
  constructor() {}

  static async createUserProject(
    userId: string,
    projectId: string
  ): Promise<void> {
    const entity = new UserProject(userId, projectId);
    await userProjectMapper.save(entity);
  }

  static async updateUserProject(
    userProjectId: string,
    userId: string,
    projectId: string
  ): Promise<void> {
    const entity = new UserProject(userId, projectId, userProjectId);
    await userProjectMapper.save(entity);
  }

  static async getUserProjectById(id: string): Promise<UserProject | null> {
    return await userProjectMapper.getById(id);
  }

  static async getAllUserProjects(): Promise<UserProject[]> {
    return await userProjectMapper.getAll();
  }

  static async deleteUserProject(id: string): Promise<void> {
    await userProjectMapper.delete(id);
  }
}
