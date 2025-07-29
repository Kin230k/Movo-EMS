import { Operation } from '../../operation.enum';

export class Action {
  constructor(
    public actionType: string,
    public actionId?: string
  ) {}

  get operation(): Operation {
    return this.actionId ? Operation.UPDATE : Operation.CREATE;
  }
}