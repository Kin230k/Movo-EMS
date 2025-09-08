import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { Multilingual } from '../../../models/multilingual.type';

import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { AdminService } from '../../../models/auth/admin/admin.service';
import { CurrentUser } from '../../../utils/currentUser.class';
import { authenticateAdmin } from '../../../utils/authUtils';

export interface AdminUpdateData {
  adminId?: string;
  qid: string;
  name: Multilingual;
  dateOfBirth?: string | null;
  jobPosition?: string | null;
}

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function updateAdminHandler(
  request: CallableRequest<AdminUpdateData>
): Promise<OperationResult> {
  // safe-read request.data
  const { adminId, qid, name, dateOfBirth, jobPosition } =
    request.data || ({} as AdminUpdateData);

  // require caller to be authenticated
  const uid = request.auth?.uid;
  if (!uid) {
    logger.warn('updateAdminHandler: unauthenticated request');
    return {
      success: false,
      issues: [{ field: 'auth', message: 'Unauthorized' }],
    };
  }

  const callerUuid = firebaseUidToUuid(uid);
  const targetId = adminId ?? callerUuid;

  // If updating someone else's record, require admin privileges via helper
  if (targetId !== callerUuid) {
    const authResult = await authenticateAdmin(request);
    if (!authResult.success) {
      // authenticateAdmin returns { success: false, issues } on failure —
      // return that directly so the shape matches OperationResult
      return authResult;
    }
    // authenticateAdmin already set CurrentUser and returned caller info if needed
  } else {
    // updating own record — set current user for audit/context
    CurrentUser.setUuid(callerUuid);
  }

  try {
    await AdminService.updateAdmin(
      targetId,
      qid,
      name,
      dateOfBirth ?? null,
      jobPosition ?? null
    );
    return { success: true };
  } catch (err: any) {
    logger.error('updateAdminHandler: update admin failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}
