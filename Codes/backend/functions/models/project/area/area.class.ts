import { Operation } from '../../operation.enum';

export class Area {
  constructor(
    public name: string,
    public locationId: string,
    public areaId?: string
  ) {}

  get operation(): Operation {
    return this.areaId ? Operation.UPDATE : Operation.CREATE;
  }
}