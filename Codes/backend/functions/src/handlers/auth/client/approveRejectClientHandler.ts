// approveRejectClientHandler.ts

import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { ClientStatus } from '../../../models/client_status.enum';
import { ClientService } from '../../../models/project/client/client.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';

export interface ApproveRejectClientData {
  clientId: string;
  approve: boolean;
}

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function approveRejectClientHandler(
  request: CallableRequest<ApproveRejectClientData>
): Promise<OperationResult> {
  const { clientId, approve } = request.data;
  const issues: FieldIssue[] = [];

  if (!clientId)
    issues.push({ field: 'clientId', message: 'Client ID is required' });
  if (approve === undefined)
    issues.push({ field: 'approve', message: 'Approval flag is required' });

  if (issues.length > 0) return { success: false, issues };

  const newStatus = approve ? ClientStatus.Accepted : ClientStatus.Rejected;

  try {
    // Fetch client first (optional but safer)
    const client = await ClientService.getClientById(clientId);
    if (!client) {
      return {
        success: false,
        issues: [{ field: 'clientId', message: 'Client not found' }],
      };
    }

    await ClientService.updateClient(
      client.clientId!, // or clientId, assuming id field exists
      client.name,
      client.contactEmail,
      client.contactPhone,
      client.logo,
      client.company,
      newStatus
    );
  } catch (dbErr: any) {
    logger.error('Failed to update client status:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }

  return { success: true };
}
