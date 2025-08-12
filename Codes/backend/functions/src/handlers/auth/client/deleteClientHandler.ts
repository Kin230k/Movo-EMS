import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { ClientService } from '../../../models/project/client/client.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';

export interface DeleteClientData {
  clientId: string;
}

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function deleteClientHandler(
  request: CallableRequest<DeleteClientData>
): Promise<OperationResult> {
  const { clientId } = request.data;

  if (!clientId) {
    return {
      success: false,
      issues: [{ field: 'clientId', message: 'Client ID is required' }],
    };
  }

  try {
    await ClientService.deleteClient(clientId);
  } catch (dbErr: any) {
    logger.error('Failed to delete client:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }

  return { success: true };
}
