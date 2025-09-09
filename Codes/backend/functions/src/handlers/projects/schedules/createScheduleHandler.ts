import { CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { FieldIssue } from '../../../utils/types';
import { parseDbError } from '../../../utils/dbErrorParser';
import { authenticateCaller } from '../../../utils/authUtils';
import { ScheduleService } from '../../../models/project/schedule/schedule.service';

export interface CreateScheduleData {
  startTime: string;
  endTime: string;
  projectId?: string;
  locationId?: string;
}

export interface CreateScheduleResult {
  success: boolean;
  issues?: FieldIssue[];
}

export async function createScheduleHandler(
  request: CallableRequest<CreateScheduleData>
): Promise<CreateScheduleResult> {
  const issues: FieldIssue[] = [];
  const auth = await authenticateCaller(request);
  if (!auth.success) return auth;

  const { startTime, endTime, projectId, locationId } = request.data || {};

  // Basic required fields
  if (!startTime) issues.push({ field: 'startTime', message: 'startTime is required' });
  if (!endTime) issues.push({ field: 'endTime', message: 'endTime is required' });
  if (!projectId && !locationId) {
    issues.push({ 
      field: 'projectId', 
      message: 'Either projectId or locationId must be provided' 
    });
    issues.push({ 
      field: 'locationId', 
      message: 'Either projectId or locationId must be provided' 
    });
  }

  // Validate that both aren't provided (if that's not allowed)
  if (projectId && locationId) {
    issues.push({ 
      field: 'projectId', 
      message: 'Cannot provide both projectId and locationId' 
    });
    issues.push({ 
      field: 'locationId', 
      message: 'Cannot provide both projectId and locationId' 
    });
  }

  // Date/time parse checks
  if (startTime && isNaN(Date.parse(startTime))) {
    issues.push({ field: 'startTime', message: 'startTime must be a valid date/time string' });
  }
  if (endTime && isNaN(Date.parse(endTime))) {
    issues.push({ field: 'endTime', message: 'endTime must be a valid date/time string' });
  }

  issues.push(...validateScheduleTimeConsistency(startTime, endTime));

  if (issues.length > 0) return { success: false, issues };

  try {
    // Generate createdAt timestamp on the server
    const createdAt = new Date().toISOString();
    
    await ScheduleService.createSchedule(
      createdAt,
      startTime,
      endTime,
      projectId!,
      locationId!
    );
    return { success: true };
  } catch (dbErr: any) {
    logger.error('Schedule creation DB write failed:', dbErr);
    const dbIssues = parseDbError(dbErr);
    return { success: false, issues: dbIssues };
  }
}

/**
 * Extra business rule validations for schedules
 */
function validateScheduleTimeConsistency(startTime?: string, endTime?: string): FieldIssue[] {
  const issues: FieldIssue[] = [];

  if (startTime && endTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (start >= end) {
      issues.push({
        field: 'timeRange',
        message: 'startTime must be earlier than endTime',
      });
    }
  }

  return issues;
}