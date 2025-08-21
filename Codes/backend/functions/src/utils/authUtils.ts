import { getAuth } from 'firebase-admin/auth';
import { firebaseUidToUuid } from './firebaseUidToUuid';
import { CallableRequest } from 'firebase-functions/https';
import { logger } from 'firebase-functions';
import { CurrentUser } from './currentUser.class';
import { AdminService } from '../models/auth/admin/admin.service';
import { parseDbError } from './dbErrorParser';
import { FieldIssue } from './types';
import { UserService } from '../models/auth/user/user.service';
import { ClientService } from '../models/project/client/client.service';
import { isValidEmail, isValidPhone } from './validators';

/**
 * NOTE: make sure firebase-admin has been initialized somewhere before calling getAuth()
 * e.g. in your entrypoint:
 * import admin from 'firebase-admin';
 * if (!admin.apps.length) admin.initializeApp();
 */

// Check if email exists in Firebase Auth
export async function emailExists(email: string): Promise<boolean> {
  if (isValidEmail(email)) {
    try {
      await getAuth().getUserByEmail(email);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') return false;
      throw error;
    }
  } else {
    return false;
  }
}

// Check if phone number exists in Firebase Auth
export async function phoneExists(phone: string): Promise<boolean> {
  if (isValidPhone(phone)) {
    try {
      await getAuth().getUserByPhoneNumber(phone);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') return false;
      throw error;
    }
  } else {
    return false;
  }
}

export interface AuthenticateResultSuccess {
  success: true;
  callerUid: string;
  callerUuid: string;
  callerAdmin?: any;
}

export interface AuthenticateResultFailure {
  success: false;
  issues: FieldIssue[];
}

export type AuthenticateResult =
  | AuthenticateResultSuccess
  | AuthenticateResultFailure;

/**
 * Ensure the request is from an authenticated admin.
 */
export async function authenticateAdmin(
  request: CallableRequest
): Promise<AuthenticateResult> {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    logger.warn('authenticateAdmin: unauthenticated request');
    return {
      success: false,
      issues: [
        {
          field: 'auth',
          message: 'Unauthorized: caller must be authenticated',
        },
      ],
    };
  }

  const callerUuid = firebaseUidToUuid(callerUid);
  CurrentUser.setUuid(callerUuid);

  try {
    const callerAdmin = await AdminService.getAdminById(callerUuid);
    if (!callerAdmin) {
      logger.warn('authenticateAdmin: caller does not have an admin record', {
        callerUuid,
      });
      return {
        success: false,
        issues: [
          { field: 'auth', message: 'Forbidden: admin record required' },
        ],
      };
    }

    return { success: true, callerUid, callerUuid, callerAdmin };
  } catch (err: any) {
    logger.error(
      'authenticateAdmin: failed to verify caller admin record',
      err
    );
    return { success: false, issues: parseDbError(err) };
  }
}

export async function authenticateClient(
  request: CallableRequest
): Promise<AuthenticateResult> {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    logger.warn('authenticateClient: unauthenticated request');
    return {
      success: false,
      issues: [
        {
          field: 'auth',
          message: 'Unauthorized: caller must be authenticated',
        },
      ],
    };
  }

  const callerUuid = firebaseUidToUuid(callerUid);
  CurrentUser.setUuid(callerUuid);

  try {
    const callerClient = await ClientService.getClientById(callerUuid);
    if (!callerClient) {
      logger.warn('authenticateClient: caller does not have a client record', {
        callerUuid,
      });
      return {
        success: false,
        issues: [
          { field: 'auth', message: 'Forbidden: client record required' },
        ],
      };
    }

    return { success: true, callerUid, callerUuid, callerAdmin: callerClient };
  } catch (err: any) {
    logger.error(
      'authenticateClient: failed to fetch caller client record',
      err
    );
    return { success: false, issues: parseDbError(err) };
  }
}

export async function authenticateUser(
  request: CallableRequest
): Promise<AuthenticateResult> {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    logger.warn('authenticateUser: unauthenticated request');
    return {
      success: false,
      issues: [
        {
          field: 'auth',
          message: 'Unauthorized: caller must be authenticated',
        },
      ],
    };
  }

  const callerUuid = firebaseUidToUuid(callerUid);
  CurrentUser.setUuid(callerUuid);

  try {
    const callerUser = await UserService.getUserById(callerUuid);
    if (!callerUser) {
      logger.warn('authenticateUser: caller does not have a user record', {
        callerUuid,
      });
      return {
        success: false,
        issues: [{ field: 'auth', message: 'Forbidden: user record required' }],
      };
    }

    return { success: true, callerUid, callerUuid, callerAdmin: callerUser };
  } catch (err: any) {
    logger.error('authenticateUser: failed to fetch caller user record', err);
    return { success: false, issues: parseDbError(err) };
  }
}

/**
 * Minimal authenticator: only checks that the request is authenticated.
 */
export async function authenticateCaller(
  request: CallableRequest
): Promise<AuthenticateResult> {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    logger.warn('authenticateCaller: unauthenticated request');
    return {
      success: false,
      issues: [
        {
          field: 'auth',
          message: 'Unauthorized: caller must be authenticated',
        },
      ],
    };
  }

  try {
    const callerUuid = firebaseUidToUuid(callerUid);
    CurrentUser.setUuid(callerUuid);

    return { success: true, callerUid, callerUuid };
  } catch (err: any) {
    logger.error(
      'authenticateCaller: failed converting caller uid to uuid',
      err
    );
    return { success: false, issues: parseDbError(err) };
  }
}

export interface AuthorizeClientAccessSuccess {
  success: true;
  isAdmin: boolean;
  callerAdmin?: any;
  callerClient?: any;
  callerUid: string;
  callerUuid: string;
}
export type AuthorizeClientAccessResult =
  | AuthorizeClientAccessSuccess
  | AuthenticateResultFailure;

export async function authorizeClientAccess(
  request: CallableRequest,
  targetClientId: string
): Promise<AuthorizeClientAccessResult> {
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { callerUid, callerUuid } = auth;

  try {
    const callerAdmin = await AdminService.getAdminById(callerUuid);
    if (callerAdmin) {
      return {
        success: true,
        isAdmin: true,
        callerAdmin,
        callerUid,
        callerUuid,
      };
    }

    const callerClient = await ClientService.getClientById(callerUuid);
    if (!callerClient) {
      logger.warn(
        'authorizeClientAccess: caller has no admin or client record',
        { callerUuid }
      );
      return {
        success: false,
        issues: [
          {
            field: 'auth',
            message: 'Forbidden: admin or client record required',
          },
        ],
      };
    }

    const callerClientId =
      (callerClient as any).clientId ?? (callerClient as any).id;
    if (!callerClientId) {
      logger.error('authorizeClientAccess: caller client record missing id', {
        callerUuid,
        callerClient,
      });
      return {
        success: false,
        issues: [
          {
            field: 'auth',
            message: 'Forbidden: unable to verify client ownership',
          },
        ],
      };
    }

    if (callerClientId !== targetClientId) {
      logger.warn(
        'authorizeClientAccess: client attempted to access another client',
        { callerUuid, callerClientId, requested: targetClientId }
      );
      return {
        success: false,
        issues: [
          {
            field: 'auth',
            message: 'Forbidden: clients may only access their own account',
          },
        ],
      };
    }

    return {
      success: true,
      isAdmin: false,
      callerClient,
      callerUid,
      callerUuid,
    };
  } catch (err: any) {
    logger.error('authorizeClientAccess: failed to authorize caller', err);
    return { success: false, issues: parseDbError(err) };
  }
}
