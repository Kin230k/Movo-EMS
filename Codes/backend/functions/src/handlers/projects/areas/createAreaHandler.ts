import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { Multilingual } from '../../../models/multilingual.type';
import { AreaService } from '../../../models/project/area/area.service';
import { authenticateClient } from '../../../utils/authUtils';

interface CreateAreaData {
  name: Multilingual;
  locationId: string;
}

export async function createAreaHandler(request: CallableRequest<CreateAreaData>) {
  const issues: FieldIssue[] = [];
  const auth = await authenticateClient(request);
  if (!auth.success) return auth;

  const { name, locationId } = request.data || {};
  if (!name || !locationId) {
    issues.push({ field: 'input', message: 'Missing required fields: name, locationId' });
    return { success: false, issues };
  }

  try {
    await AreaService.createArea(name as Multilingual, locationId);
    return { success: true };
  } catch (err: any) {
    logger.error('Area creation failed', err);
    return { success: false, issues: parseDbError(err) };
  }
}