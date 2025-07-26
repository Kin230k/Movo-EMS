import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';

export class Location {
  constructor(
    public name: Multilingual,
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