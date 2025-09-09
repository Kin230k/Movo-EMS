import { FieldIssue } from './types';

interface PostgresError {
  code?: string;
  detail?: string;
  message?: string;
  hint?: string;
}

export function parseDbError(err: PostgresError): FieldIssue[] {
  const issues: FieldIssue[] = [];

  // Normalize and take only the first line of message to avoid stack traces.
  const rawMsg = (err?.message ?? '').split('\n')[0].trim();

  // Helper: if the DB error message includes "error:" (common for reraise), return the part after it.
  const extractFriendly = (s: string) => {
    const parts = s.split(/error:\s*/i);
    return parts.length > 1 ? parts.slice(1).join('error:').trim() : s.trim();
  };

  const friendlyMsg = extractFriendly(rawMsg);

  // Handle PL/pgSQL RAISE EXCEPTION case (P0001) or any message that clearly indicates permission denial.
  if (err.code === 'P0001' || /You don'?t have permission to/i.test(rawMsg)) {
    // friendlyMsg will often be like:
    // "You don't have permission to get user by id | ليس لديك صلاحيات لإجراء غير معروف"
    // We return that full bilingual string and use a 'permission' field so the client can act on it.
    issues.push({
      field: 'permission',
      message: friendlyMsg || 'You do not have the required permission',
    });

    // Optionally include hint/detail as an extra internal issue (comment out if undesired)
    if (err.detail || err.hint) {
      issues.push({
        field: 'internal',
        message: `${err.detail ?? ''}${
          err.hint ? ' — ' + err.hint : ''
        }`.trim(),
      });
    }

    return issues;
  }

  switch (err.code) {
    case '23505': {
      // unique_violation
      const m = /\(([^)]+)\)=/.exec(err.detail || '');
      const field = m?.[1] ?? 'unknown';
      issues.push({ field, message: `${field} already exists` });
      break;
    }
    case '23502': {
      // not_null_violation
      const m = /column "([^"]+)"/.exec(err.message || '');
      const field = m?.[1] ?? 'unknown';
      issues.push({ field, message: `${field} is required` });
      break;
    }
    case '23503': {
      // foreign_key_violation
      const m = /\(([^)]+)\)=/.exec(err.detail || '');
      const field = m?.[1] ?? 'unknown';
      issues.push({ field, message: `${field} references invalid value` });
      break;
    }
    case '23514': {
      // check_violation
      issues.push({ field: 'unknown', message: 'A constraint check failed' });
      break;
    }
    case '23P01': {
      // exclusion_violation
      issues.push({
        field: 'unknown',
        message: 'A unique constraint was violated',
      });
      break;
    }
    case '22P02': {
      // invalid_text_representation
      issues.push({ field: 'unknown', message: 'Invalid input format' });
      break;
    }
    case '22001': {
      // string_data_right_truncation
      issues.push({ field: 'unknown', message: 'Input string too long' });
      break;
    }
    case '22003': {
      // numeric_value_out_of_range
      issues.push({ field: 'unknown', message: 'Number out of range' });
      break;
    }
    default:
      issues.push({
        field: 'internal',
        message: 'An unexpected database error occurred',
      });
      break;
  }

  return issues;
}
