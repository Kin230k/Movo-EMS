import { Operation } from '../../operation.enum';

export class RoleAction {
  constructor(
    public roleId: string,
    public actionId: string,
    public roleActionsId?: string
  ) {}

  get operation(): Operation {
    return this.roleActionsId ? Operation.UPDATE : Operation.CREATE;
  }
}