import projectMapper, { ProjectWithClient } from './project.mapper';
import { Project } from './project.class';
import { Multilingual } from '../../multilingual.type';
export class ProjectService {
  constructor() {}

  static async createProject(
    clientId: string,
    name: Multilingual,
    startingDate: string,
    badgeBackground?: string,
    endingDate?: string,
    description?: Multilingual | null
  ): Promise<void> {
    const entity = new Project(
      clientId,
      name,
      startingDate,
      undefined,
      badgeBackground,
      endingDate,
      description
    );
    await projectMapper.save(entity);
  }

  static async updateProject(
    projectId: string,
    clientId: string,
    name: Multilingual,
    startingDate: string,
    badgeBackground?: string,
    endingDate?: string,
    description?: Multilingual | null
  ): Promise<void> {
    const entity = new Project(
      clientId,
      name,
      startingDate,
      projectId,
      badgeBackground,
      endingDate,
      description
    );
    await projectMapper.save(entity);
  }
  static async updateProjectAsAdmin(
    projectId: string,
    clientId: string,
    name: Multilingual,
    startingDate: string,
    badgeBackground?: string,
    endingDate?: string,
    description?: Multilingual | null
  ): Promise<void> {
    const entity = new Project(
      clientId,
      name,
      startingDate,
      projectId,
      badgeBackground,
      endingDate,
      description
    );
    await projectMapper.updateAsAdmin(entity);
  }
  static async getProjectById(id: string): Promise<Project | null> {
    return await projectMapper.getById(id);
  }
   static async getProjectByClient(clientId: string): Promise<Project[] | null> {
    return await projectMapper.getByClient(clientId);
  }

  static async getAllProjects(): Promise<Project[]> {
    return await projectMapper.getAll();
  }
  
  static async getAllActiveProjects(): Promise<ProjectWithClient[]> {
    return await projectMapper.getAllActive();
  }
   
  static async getAllProjectsWithClientName(): Promise<ProjectWithClient[]> {
    return await projectMapper.getAllProjectWithClientName();
  }


  static async deleteProject(id: string): Promise<void> {
    await projectMapper.delete(id);
  }
}
