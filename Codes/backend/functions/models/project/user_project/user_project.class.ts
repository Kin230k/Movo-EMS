import { Operation } from '../../operation.enum';

export class UserProject {
  constructor(
    public userId: string,
    public projectId: string,
    public userProjectId?: string
  ) {}

  get operation(): Operation {
    return this.userProjectId ? Operation.UPDATE : Operation.CREATE;
  }
}
