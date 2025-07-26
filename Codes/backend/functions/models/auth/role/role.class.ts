import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';

export class Role {
  constructor(
    public name: Multilingual,
    public roleId?: string,
    public description?: Multilingual | null
  ) {}

  get operation(): Operation {
    return this.roleId ? Operation.UPDATE : Operation.CREATE;
  }
}