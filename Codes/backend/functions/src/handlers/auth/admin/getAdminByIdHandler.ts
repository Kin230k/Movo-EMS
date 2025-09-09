import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { AdminService } from '../../../models/auth/admin/admin.service';
import { CurrentUser } from '../../../utils/currentUser.class';
import { authenticateAdmin } from '../../../utils/authUtils';

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
  admin?: any;
}

/**
 * Any caller with an admin record may fetch another admin's record.
 * If no adminId is provided, the caller's own admin record is returned.
 */
export async function getAdminByIdHandler(
  request: CallableRequest<{ adminId?: string }>
): Promise<OperationResult> {
  const uid = request.auth?.uid;
  if (!uid) {
    logger.warn('getAdminByIdHandler: unauthenticated request');
    return {
      success: false,
      issues: [{ field: 'auth', message: 'Unauthorized' }],
    };
  }

  const callerUuid = firebaseUidToUuid(uid);
  const requestedAdminId = request.data?.adminId;
  const targetId = requestedAdminId ?? callerUuid;

  logger.debug('getAdminByIdHandler: request', { callerUuid, targetId });

  if (targetId !== callerUuid) {
    // Require the caller to have an admin record
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      return authResult; // already { success: false, issues }
    }
  } else {
    // Caller fetching own record
    CurrentUser.setUuid(callerUuid);
  }

  try {
    const adminEntity = await AdminService.getAdminById(targetId);
    if (!adminEntity) {
      logger.info('getAdminByIdHandler: admin not found', { targetId });
      return {
        success: false,
        issues: [{ field: 'admin', message: 'Not found' }],
      };
    }

    logger.debug('getAdminByIdHandler: found admin', { targetId });
    return { success: true, admin: adminEntity };
  } catch (err: any) {
    logger.error('getAdminByIdHandler: get admin failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
