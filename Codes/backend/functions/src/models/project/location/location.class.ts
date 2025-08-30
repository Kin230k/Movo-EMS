import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';
import { Project } from '../project/project.class';
import { ProjectService } from '../project/project.service';


export class Location {
  constructor(
    public name: Multilingual,
    public projectId: string|undefined,
    public locationId?: string,
    public siteMap?: string,
    public longitude?: number,
    public latitude?: number
  ) {}

  get operation(): Operation {
    return this.locationId ? Operation.UPDATE : Operation.CREATE;
  }
  
    async project(): Promise<Project | null> {
    if (!this.projectId) return null;
    return await ProjectService.getProjectById(this.projectId);
  }


}