import { UserProjectMapper } from '../../models/project/user_project/user_project.mapper';
import { UserProject } from '../../models/project/user_project/user_project.class';

export class UserProjectService {
  constructor(private readonly mapper: UserProjectMapper) {}

  async createUserProject(userId: string, projectId: string): Promise<void> {
    const entity = new UserProject(userId, projectId);
    await this.mapper.save(entity);
  }

  async updateUserProject(
    userProjectId: string,
    userId: string,
    projectId: string
  ): Promise<void> {
    const entity = new UserProject(userId, projectId, userProjectId);
    await this.mapper.save(entity);
  }

  async getUserProjectById(id: string): Promise<UserProject | null> {
    return await this.mapper.getById(id);
  }

  async getAllUserProjects(): Promise<UserProject[]> {
    return await this.mapper.getAll();
  }

  async deleteUserProject(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}
