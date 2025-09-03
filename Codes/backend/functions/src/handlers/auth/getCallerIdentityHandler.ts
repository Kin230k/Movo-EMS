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
    // Check all identities in parallel
    const [admin, client, user, projectRoles] = await Promise.all([
      AdminService.getAdminById(callerUuid),
      ClientService.getClientById(callerUuid),
      UserService.getUserById(callerUuid),
      ProjectUserRoleService.getProjectUserRoleByUser(callerUuid), // Check for any project
    ]);

    const isAdmin = !!admin;
    const isClient = !!client;
    const isUser = !!user;
    const isUserWorker = isUser && projectRoles !== null;

    return {
      isAdmin,
      isClient,
      isUserWorker,
      isUser: isUser && !isUserWorker, // User without project assignments
      isCaller: !isAdmin && !isClient && !isUser,
      role: user?.role || null,
    };
  } catch (error) {
    console.error('Error getting caller identity:', error);
    return {
      isAdmin: false,
      isClient: false,
      isUserWorker: false,
      isUser: false,
      isCaller: true, // Fallback to basic caller if error occurs
      role: null,
    };
  }
}
