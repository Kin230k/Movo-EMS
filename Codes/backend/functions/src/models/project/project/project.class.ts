import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';

export class Project {
  constructor(
    public clientId: string,
    public name: Multilingual,
    public startingDate: string,
    public projectId?: string,
    public badgeBackground?: string,
    public endingDate?: string,
    public description?: Multilingual | null
  ) {}

  get operation(): Operation {
    return this.projectId ? Operation.UPDATE : Operation.CREATE;
  }
}