import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';
import { ClientStatus } from '../../client_status.enum';

export class Client {
  constructor(
    public name: Multilingual,
    public contactEmail: string,
    public contactPhone: string,
    public company: Multilingual,
    public clientId: string,
    public logo?: string,
    public status: ClientStatus = ClientStatus.Pending
  ) {}

  public operation = Operation.CREATE;
}
