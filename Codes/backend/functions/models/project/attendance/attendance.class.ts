import { Operation } from '../../operation.enum';

export class Attendance {
  constructor(
    public date: string,
    public time: string,
    public signedWith: any,
    public signedBy: string,
    public userId: string,
    public areaId: string,
    public attendanceId?: string
  ) {}

  get operation(): Operation {
    return this.attendanceId ? Operation.UPDATE : Operation.CREATE;
  }
}