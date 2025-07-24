import { Operation } from '../../operation.enum';

export class Admin {
  constructor(
    public qid: string,
    public adminId?: string,
    public firstName?: string | null,
    public lastName?: string | null,
    public dateOfBirth?: string | null,
    public jobPosition?: string | null
  ) {}

  get operation(): Operation {
    return this.adminId ? Operation.UPDATE : Operation.CREATE;
  }
}