import { Operation } from '../../operation.enum';

export class Location {
  constructor(
    public name: string,
    public projectId: string,
    public locationId?: string,
    public siteMap?: string,
    public longitude?: number,
    public latitude?: number
  ) {}

  get operation(): Operation {
    return this.locationId ? Operation.UPDATE : Operation.CREATE;
  }
}