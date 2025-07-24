// user.ts
import { Operation } from '../../operation.enum';

export class User {
  constructor(
    public name: string,
    public email: string,
    public phone: string,
    public role: string,
    public status: string,
    public twoFaEnabled: boolean,
    public picture: string | null = null,
    public userId?: string,
    
    
  ) {}

  /** 
   * If there's an ID, we'll UPDATE; otherwise CREATE 
   */
   get operation(): Operation {
    return this.userId ? Operation.UPDATE : Operation.CREATE;
  }
}
