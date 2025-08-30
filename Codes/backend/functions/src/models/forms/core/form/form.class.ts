import { Operation } from '../../../operation.enum';

export class Form {
  constructor(
    public projectId: string | null,
    public locationId: string | null,
    public formLanguage: string,
    public formTitle: string,
    public formId?: string
  ) {}

  get operation(): Operation {
    return this.formId ? Operation.UPDATE : Operation.CREATE;
  }
}