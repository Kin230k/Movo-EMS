import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';
export class Admin {
  constructor(
    public qid: string,
    public name: Multilingual,
    public adminId?: string,
    public dateOfBirth?: string | null,
    public jobPosition?: string | null
  ) {}

  get operation(): Operation {
    return this.adminId ? Operation.UPDATE : Operation.CREATE;
  }
}