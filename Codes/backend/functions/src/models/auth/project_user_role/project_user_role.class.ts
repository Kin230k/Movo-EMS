import { Operation } from '../../operation.enum';

export class ProjectUserRole {
  constructor(
    public userId: string,
    public projectId: string,
    public roleId: string,
    public projectUserRoleId?: string,
    public createdAt?: string,
    public updatedAt?: string
  ) {}

  get operation(): Operation {
    return this.projectUserRoleId ? Operation.UPDATE : Operation.CREATE;
  }
}