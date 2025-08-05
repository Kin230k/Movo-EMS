// user.ts
import { Operation } from '../../operation.enum';
import { Multilingual } from '../../multilingual.type';
import { UserStatus } from './user_status.enum';

export class User {
  constructor(
    public name: Multilingual,
    public email: string,
    public phone: string,
    public role: string,
    public status: string,
    public twoFaEnabled: boolean,
    public picture: string | undefined,
    public operation: Operation,
    public userId?: string
  ) {}

  /**
   * If there's an ID, we'll UPDATE; otherwise CREATE
   */

  // Converts string status to enum representation
  get getStatus(): UserStatus {
    return this.status.toLowerCase() == 'active'
      ? UserStatus.Active
      : UserStatus.Inactive;
  }
}
