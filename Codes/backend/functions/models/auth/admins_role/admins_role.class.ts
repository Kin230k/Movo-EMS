import { Operation } from '../../operation.enum';

export class AdminsRole {
  constructor(
    public adminId: string,
    public roleId: string,
    public adminRoleId?: string
  ) {}

  get operation(): Operation {
    return this.adminRoleId ? Operation.UPDATE : Operation.CREATE;
  }
}
