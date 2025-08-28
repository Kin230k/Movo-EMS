import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { ClientStatus } from '../../../models/client_status.enum';
import { Multilingual } from '../../../models/multilingual.type';
import { ClientService } from '../../../models/project/client/client.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';
import { authorizeClientAccess } from '../../../utils/authUtils';

export interface UpdateClientData {
  clientId: string;
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

export async function updateClientHandler(
  request: CallableRequest<UpdateClientData>
): Promise<OperationResult> {
  // safe-read request.data
  const {
    clientId,
    name,
    contactEmail,
    contactPhone,
    logo,
    company,
    status = ClientStatus.Pending,
  } = request.data || ({} as UpdateClientData);

  const issues: FieldIssue[] = [];

  if (!clientId)
    issues.push({ field: 'clientId', message: 'Client ID is required' });
  if (!name) issues.push({ field: 'name', message: 'Name is required' });
  if (!contactEmail)
    issues.push({ field: 'contactEmail', message: 'Email is required' });
  if (!contactPhone)
    issues.push({ field: 'contactPhone', message: 'Phone is required' });


  if (issues.length > 0) return { success: false, issues };
  
  
  // authorize caller: admin can update any client, client can update only their own
  const authz = await authorizeClientAccess(request, clientId);
  if (!authz.success) {
    
    // authorizeClientAccess returns { success: false, issues } on failure
    return authz;
  }
  console.log(     clientId,
      name,
      contactEmail,
      company!,
      contactPhone,
      logo,
      status)

  try {
    await ClientService.updateClient(
      clientId,
      name,
      contactEmail,
      company!,
      contactPhone,
      logo,
      status
    );
    return { success: true };
  } catch (dbErr: any) {
    logger.error('updateClientHandler: Failed to update client:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
