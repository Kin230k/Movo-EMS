import * as logger from 'firebase-functions/logger';
import { ClientService } from '../../../models/project/client/client.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { FieldIssue } from '../../../utils/types';

export interface OperationResult {
  success: boolean;
  issues?: FieldIssue[];
}

export interface GetAllClientsResult extends OperationResult {
  clients?: Awaited<ReturnType<typeof ClientService.getAllClients>>;
}

export async function getAllClientsHandler(): Promise<GetAllClientsResult> {
  try {
    const clients = await ClientService.getAllClients();
    return { success: true, clients };
  } catch (dbErr: any) {
    logger.error('Failed to get all clients:', dbErr);
    return { success: false, issues: parseDbError(dbErr) };
  }
}
