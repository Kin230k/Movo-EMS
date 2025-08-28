import { Operation } from '../../../operation.enum';

export class Interview {
  constructor(
    public projectId: string,
    public interviewId?: string
  ) {}

  get operation(): Operation {
    return this.interviewId ? Operation.UPDATE : Operation.CREATE;
  }
}