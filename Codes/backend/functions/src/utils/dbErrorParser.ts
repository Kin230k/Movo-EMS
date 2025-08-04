import { FieldIssue } from './types';

interface PostgresError {
  code?: string;
  detail?: string;
  message?: string;
}

export function parseDbError(err: PostgresError): FieldIssue[] {
  const issues: FieldIssue[] = [];

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
