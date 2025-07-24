import { Operation } from '../../operation.enum';

export class Role {
  constructor(
    public name: string,
    public roleId?: string,
    public description?: string | null
  ) {}

  get operation(): Operation {
    return this.roleId ? Operation.UPDATE : Operation.CREATE;
  }
}