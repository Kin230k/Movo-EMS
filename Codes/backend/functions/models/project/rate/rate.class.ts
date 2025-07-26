import { Operation } from '../../operation.enum';

export class Rate {
  constructor(
    public hourlyRate: number,
    public userId: string,
    public projectId: string,
    public rateId?: string
  ) {}

  get operation(): Operation {
    return this.rateId ? Operation.UPDATE : Operation.CREATE;
  }
}
