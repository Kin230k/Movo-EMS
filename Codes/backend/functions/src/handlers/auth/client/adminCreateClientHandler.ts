// adminCreateClientHandler.ts

import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';

import { Multilingual } from '../../../models/multilingual.type';
import { ClientStatus } from '../../../models/client_status.enum';
import { ClientService } from '../../../models/project/client/client.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';

export interface AdminCreateClientData {
  name: Multilingual;
  contactEmail: string;
  contactPhone: string;
  password: string;
  logo?: string;
  company?: Multilingual | null;
}

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
  uid?: string; // Firebase Auth user ID
}

export async function adminCreateClientHandler(
  request: CallableRequest<AdminCreateClientData>
): Promise<OperationResult> {
  const { name, contactEmail, contactPhone, password, logo, company } =
    request.data;

  const issues: FieldIssue[] = [];

  if (!name) issues.push({ field: 'name', message: 'Name is required' });
  if (!contactEmail)
    issues.push({ field: 'contactEmail', message: 'Email is required' });
  if (!contactPhone)
    issues.push({ field: 'contactPhone', message: 'Phone is required' });
  if (!password)
    issues.push({ field: 'password', message: 'Password is required' });

  if (issues.length > 0) return { success: false, issues };

  let userRecord: admin.auth.UserRecord;
  try {
    userRecord = await admin.auth().createUser({
      email: contactEmail,
      password,
      emailVerified: false,
      disabled: false,
    });
  } catch (err: any) {
    logger.error('Firebase Auth createUser failed:', err);
    return {
      success: false,
      issues: [
        {
          field: 'contactEmail',
          message: `Firebase Auth error: ${err.message}`,
        },
      ],
    };
  }

  try {
    await ClientService.createClient(
      name,
      contactEmail,
      contactPhone,
      userRecord.uid,
      logo,
      company,
      ClientStatus.Accepted // admin-created clients are active immediately
    );
  } catch (dbErr: any) {
    logger.error('Failed to create client in DB:', dbErr);
    // Cleanup: delete Firebase user if DB save fails
    try {
      await admin.auth().deleteUser(userRecord.uid);
    } catch (cleanupErr) {
      logger.error(
        'Failed to cleanup Firebase user after DB failure:',
        cleanupErr
      );
    }
    return { success: false, issues: parseDbError(dbErr) };
  }
  // sends verfication and congrationlation for the client via email

  return { success: true, uid: userRecord.uid };
}
