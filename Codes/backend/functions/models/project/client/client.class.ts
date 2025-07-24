import { Operation } from '../../operation.enum';

export class Client {
  constructor(
    public name: string,
    public contactEmail: string,
    public contactPhone: string,
    public clientId?: string,
    public logo?: string,
    public company?: string
  ) {}

  get operation(): Operation {
    return this.clientId ? Operation.UPDATE : Operation.CREATE;
  }
}