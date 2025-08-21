import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';
import { ClientStatus } from '../../client_status.enum';

export class Client {
  constructor(
    public name: Multilingual,
    public contactEmail: string,
    public contactPhone: string,
    public clientId?: string,
    public logo?: string,
    public company?: Multilingual | null,
    public status: ClientStatus = ClientStatus.Pending
  ) {}

  public operation = Operation.CREATE;
}
