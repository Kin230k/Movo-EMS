import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { ClientStatus } from '../../../models/client_status.enum';
import { Multilingual } from '../../../models/multilingual.type';
import { ClientService } from '../../../models/project/client/client.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { authenticateCaller } from '../../../utils/authUtils';

export interface CreateClientData {
  name: Multilingual;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  company?: Multilingual | null;
  status?: ClientStatus;
}

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function createClientHandler(
  request: CallableRequest<CreateClientData>
): Promise<OperationResult> {
  // require that the caller is authenticated (logged in)
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth; // returns the same shape { success:false, issues }
  // safe-read request.data
  const {
    name,
    contactEmail,
    contactPhone,
    logo,
    company,
    status = ClientStatus.Pending,
  } = request.data || ({} as CreateClientData);

  const issues: FieldIssue[] = [];

  if (!name) issues.push({ field: 'name', message: 'Name is required' });
  if (!contactEmail)
    issues.push({ field: 'contactEmail', message: 'Email is required' });
  if (!contactPhone)
    issues.push({ field: 'contactPhone', message: 'Phone is required' });

  if (issues.length > 0) return { success: false, issues };

  try {
    await ClientService.createClient(
      name,
      contactEmail,
      contactPhone,
      auth.callerUuid,
      logo,
      company,
      status
    );
  } catch (dbErr: any) {
    logger.error('createClientHandler: Failed to create client:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }

  return { success: true };
}
