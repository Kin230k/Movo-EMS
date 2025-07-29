import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';

export class Area {
  constructor(
    public name: Multilingual,
    public locationId: string,
    public areaId?: string
  ) {}

  get operation(): Operation {
    return this.areaId ? Operation.UPDATE : Operation.CREATE;
  }
}