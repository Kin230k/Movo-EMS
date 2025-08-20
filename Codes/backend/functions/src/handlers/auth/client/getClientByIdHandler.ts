import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { ClientService } from '../../../models/project/client/client.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { authorizeClientAccess } from '../../../utils/authUtils';

export interface GetClientByIdData {
  clientId: string;
}

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
}

export interface GetClientByIdResult extends OperationResult {
  client?: Awaited<ReturnType<typeof ClientService.getClientById>>;
}

export async function getClientByIdHandler(
  request: CallableRequest<GetClientByIdData>
): Promise<GetClientByIdResult> {
  const { clientId } = request.data || ({} as GetClientByIdData);

  if (!clientId) {
    return {
      success: false,
      issues: [{ field: 'clientId', message: 'Client ID is required' }],
    };
  }

  // use the helper to authorize access
  const authz = await authorizeClientAccess(request, clientId);
  if (!authz.success) return authz;

  try {
    const client = await ClientService.getClientById(clientId);
    if (!client) {
      return {
        success: false,
        issues: [{ field: 'clientId', message: 'Client not found' }],
      };
    }
    return { success: true, client };
  } catch (dbErr: any) {
    logger.error('getClientByIdHandler: failed to fetch client', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
