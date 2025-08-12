import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { Multilingual } from '../../../models/multilingual.type';

import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { AdminService } from '../../../models/auth/admin/admin.service';

export interface AdminCreateData {
  qid: string;
  name: Multilingual;
  dateOfBirth?: string | null;
  jobPosition?: string | null;
  email: string;
  password: string;
}

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
  uid?: string;
}

export async function createAdminHandler(
  request: CallableRequest<AdminCreateData>
): Promise<OperationResult> {
  const { qid, name, dateOfBirth, jobPosition, email, password } = request.data;
  const issues: FieldIssue[] = [];

  if (!qid) issues.push({ field: 'qid', message: 'QID is required' });
  if (!name) issues.push({ field: 'name', message: 'Name is required' });
  if (!email) issues.push({ field: 'email', message: 'Email is required' });
  if (!password)
    issues.push({ field: 'password', message: 'Password is required' });

  if (issues.length > 0) return { success: false, issues };

  let userRecord: admin.auth.UserRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    });
  } catch (err: any) {
    logger.error('Firebase Auth createUser failed:', err);
    return {
      success: false,
      issues: [{ field: 'email', message: err.message }],
    };
  }

  try {
    const uuid = firebaseUidToUuid(userRecord.uid);
    await AdminService.createAdmin(
      qid,
      name,
      uuid,
      dateOfBirth ?? null,
      jobPosition ?? null
    );
  } catch (dbErr: any) {
    logger.error('Failed to create admin in DB:', dbErr);
    try {
      await admin.auth().deleteUser(userRecord.uid);
    } catch (cleanupErr) {
      logger.error('Failed to cleanup Firebase user:', cleanupErr);
    }
    return { success: false, issues: parseDbError(dbErr) };
  }

  return { success: true, uid: userRecord.uid };
}
