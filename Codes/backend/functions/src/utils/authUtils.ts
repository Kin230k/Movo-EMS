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

// Check if email exists in Firebase Auth
export async function emailExists(email: string): Promise<boolean> {
  try {
    await getAuth().getUserByEmail(email);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') return false;
    throw error; // Re-throw other errors
  }
}

// Check if phone number exists in Firebase Auth
export async function phoneExists(phone: string): Promise<boolean> {
  try {
    await getAuth().getUserByPhoneNumber(phone);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') return false;
    throw error; // Re-throw other errors
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
 * - Returns success=false with issues if unauthorized / forbidden / DB error.
 * - Returns success=true with callerUid, callerUuid and callerAdmin on success.
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

  // convert caller uid -> uuid and set current user for audit/context
  const callerUuid = firebaseUidToUuid(callerUid);
  CurrentUser.setUuid(callerUuid);

  // verify caller has an admin record in DB (AdminService)
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

    // success
    return {
      success: true,
      callerUid,
      callerUuid,
      callerAdmin,
    };
  } catch (err: any) {
    logger.error(
      'authenticateAdmin: failed to verify caller admin record',
      err
    );
    return { success: false, issues: parseDbError(err) };
  }
}

/**
 * Ensure the request is from an authenticated client (a client record exists for the caller).
 * Returns the same AuthenticateResult union: success=true includes callerUid, callerUuid and callerAdmin (here a client).
 */
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
    // NOTE: this assumes ClientService.getClientById accepts the callerUuid.
    // If your client mapping uses a dedicated "getByUserId" method, switch to that.
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

    return {
      success: true,
      callerUid,
      callerUuid,
      callerAdmin: callerClient, // reusing field name from AuthenticateResult
    };
  } catch (err: any) {
    logger.error(
      'authenticateClient: failed to fetch caller client record',
      err
    );
    return { success: false, issues: parseDbError(err) };
  }
}

/**
 * Ensure the request is from an authenticated user (a user record exists for the caller).
 * Returns the same AuthenticateResult union: success=true includes callerUid, callerUuid and callerAdmin (here a user).
 */
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
    // Note: this assumes UserService.getUserById accepts the callerUuid.
    // If your UserService expects a different id or method, switch to that method.
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

    return {
      success: true,
      callerUid,
      callerUuid,
      callerAdmin: callerUser, // reusing field name from AuthenticateResult
    };
  } catch (err: any) {
    logger.error('authenticateUser: failed to fetch caller user record', err);
    return { success: false, issues: parseDbError(err) };
  }
}
/**
 * Minimal authenticator: only checks that the request is authenticated.
 * - sets CurrentUser.setUuid(callerUuid)
 * - returns callerUid & callerUuid on success
 * - does NOT check DB records
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
    // set CurrentUser for audit/context
    CurrentUser.setUuid(callerUuid);

    return {
      success: true,
      callerUid,
      callerUuid,
    };
  } catch (err: any) {
    logger.error(
      'authenticateCaller: failed converting caller uid to uuid',
      err
    );
    return { success: false, issues: parseDbError(err) };
  }
}
/**
 * Minimal auth result types
 */
export interface AuthenticateCallerSuccess {
  success: true;
  callerUid: string;
  callerUuid: string;
}
export interface AuthenticateFailure {
  success: false;
  issues: FieldIssue[];
}
export type AuthenticateCallerResult =
  | AuthenticateCallerSuccess
  | AuthenticateFailure;
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
  | AuthenticateFailure;

/**
 * authorizeClientAccess:
 * - caller must be authenticated (sets CurrentUser)
 * - if caller has an admin record => allowed to access any client
 * - else if caller has a client record => allowed only if they own targetClientId
 * - otherwise forbidden
 *
 * NOTE: this implementation uses AdminService.getAdminById(callerUuid) and
 * ClientService.getClientById(callerUuid) to detect caller records. If your
 * services have different lookup methods (e.g. getByUserId), swap them accordingly.
 */
export async function authorizeClientAccess(
  request: CallableRequest,
  targetClientId: string
): Promise<AuthorizeClientAccessResult> {
  // authenticate caller & set CurrentUser
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { callerUid, callerUuid } = auth;

  try {
    // 1) check admin record
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

    // 2) check client record (caller)
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

    // determine caller's clientId from returned entity (defensive)
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
