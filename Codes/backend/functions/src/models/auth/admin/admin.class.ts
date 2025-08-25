import { Multilingual } from '../../multilingual.type';
import { Operation } from '../../operation.enum';
export class Admin {
  constructor(
    public qid: string,
    public name: Multilingual,
    public adminId?: string,
    public dateOfBirth?: string | null,
    public jobPosition?: string | null
  ) {}
  public operation = Operation.CREATE;
}
