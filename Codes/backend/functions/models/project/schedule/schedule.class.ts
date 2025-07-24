import { Operation } from '../../operation.enum';

export class Schedule {
  constructor(
    public createdAt: string,
    public startTime: string,
    public endTime: string,
    public projectId: string,
    public locationId: string,
    public scheduleId?: string
  ) {}

  get operation(): Operation {
    return this.scheduleId ? Operation.UPDATE : Operation.CREATE;
  }
}
