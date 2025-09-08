import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { UserService } from '../../models/auth/user/user.service';
import { parseDbError } from '../../utils/dbErrorParser';
import { FieldIssue } from '../../utils/types';
import { authenticateUser } from '../../utils/authUtils';

export interface GetUsersSalaryResult {
  success: boolean;
  salary?: number;
  userId?: string;
  year?: number;
  month?: number;
  issues?: FieldIssue[];
}


export async function getUsersSalaryHandler(
  request: CallableRequest
): Promise<GetUsersSalaryResult> {
  try {
    const auth = await authenticateUser(request);
    if (!auth.success) return auth;





    const salary = await UserService.getUsersSalary(new Date().getFullYear(), new Date().getMonth() + 1);

    return {
      success: true,
      salary,
      
    };
  } catch (err: any) {
    logger.error('Salary calculation failed:', err);
    const dbIssues = parseDbError(err);
    return { success: false, issues: dbIssues };
  }
}
