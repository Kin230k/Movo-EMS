import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';

export class Client {
  constructor(
    public name: Multilingual,
    public contactEmail: string,
    public contactPhone: string,
    public clientId?: string,
    public logo?: string,
    public company?: Multilingual | null
  ) {}

  get operation(): Operation {
    return this.clientId ? Operation.UPDATE : Operation.CREATE;
  }
}