import * as logger from 'firebase-functions/logger';

import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { AdminService } from '../../../models/auth/admin/admin.service';

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
  admins?: any[];
}

export async function getAllAdminsHandler(): Promise<OperationResult> {
  try {
    const admins = await AdminService.getAllAdmins();
    return { success: true, admins };
  } catch (err: any) {
    logger.error('Get all admins failed:', err);
    return { success: false, issues: parseDbError(err) };
  }
}
