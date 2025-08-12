import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { AdminService } from '../../../models/auth/admin/admin.service';

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
  admin?: any;
}

export async function getAdminByIdHandler(
  request: CallableRequest<{ adminId?: string }>
): Promise<OperationResult> {
  const uid = request.auth?.uid;
  if (!uid) {
    return {
      success: false,
      issues: [{ field: 'auth', message: 'Unauthorized' }],
    };
  }

  const targetId = request.data.adminId ?? firebaseUidToUuid(uid);

  try {
    const adminEntity = await AdminService.getAdminById(targetId);
    if (!adminEntity) {
      return {
        success: false,
        issues: [{ field: 'admin', message: 'Not found' }],
      };
    }
    return { success: true, admin: adminEntity };
  } catch (err: any) {
    logger.error('Get admin failed:', err);
    return { success: false, issues: parseDbError(err) };
  }
}
