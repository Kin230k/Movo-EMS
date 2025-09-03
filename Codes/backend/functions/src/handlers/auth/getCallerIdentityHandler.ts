// getCallerIdentityHandler.ts
import { CallableRequest } from 'firebase-functions/https';
import { authenticateCaller } from '../../utils/authUtils';
import { AdminService } from '../../models/auth/admin/admin.service';
import { ClientService } from '../../models/project/client/client.service';
import { UserService } from '../../models/auth/user/user.service';
import { ProjectUserRoleService } from '../../models/auth/project_user_role/project_user_role.service';

export interface CallerIdentity {
  isAdmin: boolean;
  isClient: boolean;
  isUserWorker: boolean;
  isUser: boolean;
  isCaller: boolean;
  role: string | null;
}

export async function getCallerIdentityHandler(
  request: CallableRequest
): Promise<CallerIdentity> {
  // First authenticate the caller
  const authResult = await authenticateCaller(request);
  if (!authResult.success) {
    return {
      isAdmin: false,
      isClient: false,
      isUserWorker: false,
      isUser: false,
      isCaller: false,
      role: null,
    };
  }

  const callerUuid = authResult.callerUuid;

  try {
    // Check User first
    const user = await UserService.getUserById(callerUuid);
    if (user) {
      const projectRoles =
        await ProjectUserRoleService.getProjectUserRoleByUser(callerUuid);
      const isUserWorker = projectRoles !== null;

      return {
        isAdmin: false,
        isClient: false,
        isUserWorker, // Can be true or false
        isUser: true, // Always true if user exists
        isCaller: false,
        role: user.role,
      };
    }

    // Check Client next
    const client = await ClientService.getClientById(callerUuid);
    if (client) {
      return {
        isAdmin: false,
        isClient: true,
        isUserWorker: false,
        isUser: false,
        isCaller: false,
        role: null,
      };
    }

    // Check Admin last
    const admin = await AdminService.getAdminById(callerUuid);
    if (admin) {
      return {
        isAdmin: true,
        isClient: false,
        isUserWorker: false,
        isUser: false,
        isCaller: false,
        role: null,
      };
    }

    // Fallback to basic caller if no identity found
    return {
      isAdmin: false,
      isClient: false,
      isUserWorker: false,
      isUser: false,
      isCaller: true,
      role: null,
    };
  } catch (error) {
    console.error('Error getting caller identity:', error);
    return {
      isAdmin: false,
      isClient: false,
      isUserWorker: false,
      isUser: false,
      isCaller: true,
      role: null,
    };
  }
}
