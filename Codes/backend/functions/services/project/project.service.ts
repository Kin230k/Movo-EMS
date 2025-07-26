import { ProjectMapper } from '../../models/project/project/project.mapper';
import { Project } from '../../models/project/project/project.class';
import { Operation } from '../../models/operation.enum';
import { Multilingual } from '../../models/multilingual.type';
export class ProjectService {
  constructor(private readonly mapper: ProjectMapper) {}

async createProject(
  clientId: string,
  name: Multilingual,
  startingDate: string,
  badgeBackground?: string,
  endingDate?: string,
  description?: Multilingual | null
): Promise<void> {
  const entity = new Project(clientId, name, startingDate, undefined, badgeBackground, endingDate, description);
  await this.mapper.save(entity);
}

async updateProject(
  projectId: string,
  clientId: string,
  name: Multilingual,
  startingDate: string,
  badgeBackground?: string,
  endingDate?: string,
  description?: Multilingual | null
): Promise<void> {
  const entity = new Project(clientId, name, startingDate, projectId, badgeBackground, endingDate, description);
  await this.mapper.save(entity);
}

  async getProjectById(id: string): Promise<Project | null> {
    return await this.mapper.getById(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.mapper.getAll();
  }

  async deleteProject(id: string): Promise<void> {
    await this.mapper.delete(id);
  }
}