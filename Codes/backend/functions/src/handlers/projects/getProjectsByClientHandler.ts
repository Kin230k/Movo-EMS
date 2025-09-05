import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../utils/types';
import { parseDbError } from '../../utils/dbErrorParser';
import { authenticateClient } from '../../utils/authUtils';
import { ProjectService } from '../../models/project/project/project.service';
import { Project } from '../../models/project/project/project.class';

export interface GetProjectByClientData {}

export interface GetProjectByClientResult {
  success: boolean;
  projects?: Project[] | null;
  issues?: FieldIssue[];
}

export async function getProjectsByClientHandler(
  request: CallableRequest<GetProjectByClientData>
): Promise<GetProjectByClientResult> {
  let auth;
  try {
    // Authenticate as client
    auth = await authenticateClient(request);
    if (!auth.success) {
      return { success: false, issues: auth.issues };
    }

    // Ensure authenticated client is only accessing its own data
    // if (auth.callerUuid !== clientId) {
    //   logger.warn(
    //     'getProjectsByClient: client tried to access another client project',
    //     {
    //       callerUuid: auth.callerUuid,
    //       requested: clientId,
    //     }
    //   );
    //   return {
    //     success: false,
    //     issues: [
    //       {
    //         field: 'auth',
    //         message: 'Forbidden: clients can only access their own projects',
    //       },
    //     ],
    //   };
    // }

    const projects = await ProjectService.getProjectsByClient(auth.callerUuid);
    return { success: true, projects };
  } catch (dbErr: any) {
    logger.error('getProjectsByClient failed:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
