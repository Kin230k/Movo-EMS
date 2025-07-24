import { Operation } from '../../operation.enum';

export class Project {
  constructor(
    public clientId: string,
    public name: string,
    public startingDate: string,
    public projectId?: string,
    public badgeBackground?: string,
    public endingDate?: string,
    public description?: string
  ) {}

  get operation(): Operation {
    return this.projectId ? Operation.UPDATE : Operation.CREATE;
  }
}