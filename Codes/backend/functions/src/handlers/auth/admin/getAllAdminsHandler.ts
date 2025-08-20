import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { AdminService } from '../../../models/auth/admin/admin.service';

import { authenticateAdmin } from '../../../utils/authUtils';

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
  admins?: any[];
}

export async function getAllAdminsHandler(
  request: CallableRequest<unknown>
): Promise<OperationResult> {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth; // returns the same shape { success:false, issues }
  try {
    const admins = await AdminService.getAllAdmins();
    return { success: true, admins };
  } catch (err: any) {
    logger.error('getAllAdminsHandler: get all admins failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
