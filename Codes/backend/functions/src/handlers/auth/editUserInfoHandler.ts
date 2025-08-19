// src/handlers/auth/editUserInfoHandler.ts
import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../utils/types';

import { UserService } from '../../models/auth/user/user.service';
import { Multilingual } from '../../models/multilingual.type';
import { firebaseUidToUuid } from '../../utils/firebaseUidToUuid';

export interface EditUserInfoData {
  name: Multilingual;
  picture?: string;
}
export interface EditUserInfoResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function editUserInfoHandler(
  request: CallableRequest<EditUserInfoData>
): Promise<EditUserInfoResult> {
  if (!request.auth?.uid && process.env.FUNCTIONS_EMULATOR !== 'true') {
    return {
      success: false,
      issues: [
        { field: 'auth', message: 'Must be signed in to edit user info' },
      ],
    };
  }

  const issues: FieldIssue[] = [];
  const { name, picture } = request.data;

  if (!name) {
    issues.push({ field: 'name', message: 'name is required' });
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  try {
    await UserService.editUserInfo(
      firebaseUidToUuid(request.auth!.uid),
      name,
      picture
    );
  } catch (error: any) {
    logger.error('Update user info error:', error);
    return {
      success: false,
      issues: [
        {
          field: 'service',
          message: error.message || 'Failed to update user info',
        },
      ],
    };
  }

  return { success: true };
}
