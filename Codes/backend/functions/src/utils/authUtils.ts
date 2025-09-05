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
import { ProjectUserRoleService } from '../models/auth/project_user_role/project_user_role.service';

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
/**
 * Ensure the request is from an authenticated admin.
 */
export async function authenticateAdmin(
  request: CallableRequest
): Promise<AuthenticateResult> {
  const callerUid = request.auth?.uid;
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

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

  // Skip admin check if running in Firebase emulator
  if (isEmulator) {
    logger.info('authenticateAdmin: skipping admin check in emulator mode', {
      callerUuid,
    });
    return { success: true, callerUid, callerUuid, callerAdmin: null };
  }

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
    // First, try to find a client record (preferred).
    const callerClient = await ClientService.getClientById(callerUuid);
    if (callerClient) {
      return {
        success: true,
        callerUid,
        callerUuid,
        callerAdmin: callerClient,
      };
    }

    // If no client found, allow admins to call client methods (backwards compatibility).
    const callerAdmin = await AdminService.getAdminById(callerUuid);
    if (callerAdmin) {
      logger.info(
        'authenticateClient: admin caller allowed to access client method',
        { callerUuid }
      );
      return { success: true, callerUid, callerUuid, callerAdmin };
    }

    // Neither client nor admin found -> forbidden.
    logger.warn('authenticateClient: caller does not have a client record', {
      callerUuid,
    });
    return {
      success: false,
      issues: [{ field: 'auth', message: 'Forbidden: client record required' }],
    };
  } catch (err: any) {
    logger.error(
      'authenticateClient: failed to fetch caller client/admin record',
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
    // First try to find a user record (preferred).
    const callerUser = await UserService.getUserById(callerUuid);
    if (callerUser) {
      return { success: true, callerUid, callerUuid, callerAdmin: callerUser };
    }

    // If not a user, allow a client to call user methods.
    const callerClient = await ClientService.getClientById(callerUuid);
    if (callerClient) {
      logger.info(
        'authenticateUser: client caller allowed to access user method',
        { callerUuid }
      );
      return {
        success: true,
        callerUid,
        callerUuid,
        callerAdmin: callerClient,
      };
    }

    // If not a client, allow an admin to call user methods.
    const callerAdmin = await AdminService.getAdminById(callerUuid);
    if (callerAdmin) {
      logger.info(
        'authenticateUser: admin caller allowed to access user method',
        { callerUuid }
      );
      return { success: true, callerUid, callerUuid, callerAdmin };
    }

    // Not found at any level -> forbidden.
    logger.warn(
      'authenticateUser: caller does not have a user/client/admin record',
      {
        callerUuid,
      }
    );
    return {
      success: false,
      issues: [{ field: 'auth', message: 'Forbidden: user record required' }],
    };
  } catch (err: any) {
    logger.error('authenticateUser: failed to fetch caller record', err);
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
export interface AuthorizeUserProjectAccessSuccess {
  success: true;
  isAdmin: boolean;
  callerAdmin?: any;
  callerClient?: any; // added so we can return client objects
  callerUser?: any;
  callerUserProject?: any;
  callerUid: string;
  callerUuid: string;
}
export type AuthorizeUserProjectAccessResult =
  | AuthorizeUserProjectAccessSuccess
  | { success: false; issues: FieldIssue[] };

/**
 * Worker-first authorization (WEAK-FIRST):
 * 1) If caller is assigned to the project -> allow
 * 2) Else if caller is a client -> allow
 * 3) Else if caller is admin -> allow
 * 4) Otherwise -> deny
 *
 * Note: removed the "caller === target user" check per your request.
 */
export async function authorizeUserProjectAccessWorkerFirst(
  request: CallableRequest,
  targetProjectId: string
): Promise<AuthorizeUserProjectAccessResult> {
  // 1) Check authentication and set CurrentUser
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth as any; // unauthorized

  const { callerUid, callerUuid } = auth;

  try {
    // 2) Worker-first: check if caller is assigned to the project (weak privilege)
    const callerUserProject =
      await ProjectUserRoleService.getProjectUserRolesByUserAndProject(
        callerUuid,
        targetProjectId
      );

    if (callerUserProject) {
      const callerUser = await UserService.getUserById(callerUuid);
      return {
        success: true,
        isAdmin: false,
        callerUser,
        callerUserProject,
        callerUid,
        callerUuid,
      };
    }

    // 3) Check if caller is a client
    const callerClient = await ClientService.getClientById(callerUuid);
    if (callerClient) {
      return {
        success: true,
        isAdmin: false,
        callerClient,
        callerUid,
        callerUuid,
      };
    }

    // 4) Fallback to admin (strongest)
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

    // 5) Deny if none of the above
    logger.warn(
      'authorizeUserProjectAccessWorkerFirst: caller is not worker, not client, not admin',
      { callerUuid, targetProjectId }
    );
    return {
      success: false,
      issues: [
        {
          field: 'auth',
          message:
            'Forbidden: caller must be assigned to the project, be a client, or be an admin',
        },
      ],
    };
  } catch (err: any) {
    logger.error('authorizeUserProjectAccessWorkerFirst: error', err);
    return { success: false, issues: parseDbError(err) };
  }
}
