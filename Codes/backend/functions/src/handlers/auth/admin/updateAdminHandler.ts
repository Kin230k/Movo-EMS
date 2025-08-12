import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { Multilingual } from '../../../models/multilingual.type';

import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { AdminService } from '../../../models/auth/admin/admin.service';

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
  const { adminId, qid, name, dateOfBirth, jobPosition } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    return {
      success: false,
      issues: [{ field: 'auth', message: 'Unauthorized' }],
    };
  }

  const targetId = adminId ?? firebaseUidToUuid(uid);

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
    logger.error('Update admin failed:', err);
    return { success: false, issues: parseDbError(err) };
  }
}
