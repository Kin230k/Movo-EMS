// app/core/api/api.ts
// Auto-generated API client that uses Firebase Functions SDK (httpsCallable) for all calls.
// The old BASE_URL / REST approach has been removed in favor of the SDK.
// You can change the functions region with setFunctionsRegion(region).

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../main';
import { ToastService } from '../../core/services/toast.service';

export type Multilingual = { en: string; ar: string };

// Default region inferred from previous code's BASE_URL. Override with setFunctionsRegion.
let FUNCTIONS_REGION = 'us-central1';

/**
 * Set the region used when calling Firebase Functions via the SDK.
 * Example: setFunctionsRegion('europe-west1')
 */
export function setFunctionsRegion(region: string) {
  FUNCTIONS_REGION = region;
}

/**
 * Backwards-compatible stub. Original code exposed setBaseUrl. When using the Functions SDK
 * there's no base URL to set; use setFunctionsRegion instead. If you pass a URL like
 * "https://us-central1-project.cloudfunctions.net" this will attempt to extract the region
 * and set it automatically.
 */
export function setBaseUrl(url: string) {
  try {
    const m = url.match(
      /^https?:\/\/([a-z0-9-]+)-[a-z0-9-]+\.cloudfunctions\.net/i
    );
    if (m && m[1]) {
      FUNCTIONS_REGION = m[1];
    }
  } catch (e) {
    // ignore - keep default
  }
}

// --- Simple in-memory caching layer for callable results ---
type CacheEntry = { value: unknown; expiresAt: number };

interface ApiCacheConfig {
  enabled: boolean;
  defaultTtlMs: number;
  maxEntries: number;
  isCacheable: (fnName: string) => boolean;
}

const apiCacheConfig: ApiCacheConfig = {
  enabled: true,
  defaultTtlMs: 60_000,
  maxEntries: 200,
  isCacheable: (fnName: string) => /^(get|list|fetch)/i.test(fnName),
};

const responseCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<unknown>>();
const functionTtlOverride = new Map<string, number>();

// Toast handling
let globalToastService: ToastService | null = null;
export function setApiToastService(toastService: ToastService) {
  globalToastService = toastService;
}

type FieldIssue = { field: string; message: string };

function toSpacedWords(camel: string): string {
  return camel
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();
}

function successMutationMessage(fnName: string): string {
  const action = fnName.startsWith('create')
    ? 'created'
    : fnName.startsWith('update')
    ? 'updated'
    : fnName.startsWith('delete')
    ? 'deleted'
    : 'processed';
  const entity = toSpacedWords(fnName.replace(/^(create|update|delete)/i, ''));
  return `${entity} ${action} successfully`;
}

function extractIssuesMessage(issues?: FieldIssue[] | unknown): string | null {
  if (!Array.isArray(issues)) return null;
  if (issues.length === 0) return null;
  const lines = issues.map((i) =>
    [(i as FieldIssue)?.field, (i as FieldIssue)?.message ?? 'Invalid value']
      .filter(Boolean)
      .join(': ')
  );
  return lines.join('\n');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map((v) => stableStringify(v)).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const entries = keys.map(
    (k) => JSON.stringify(k) + ':' + stableStringify(obj[k])
  );
  return '{' + entries.join(',') + '}';
}

function makeCacheKey(fnName: string, payload: unknown): string {
  const param = payload === undefined ? {} : payload;
  return `${FUNCTIONS_REGION}:${fnName}:${stableStringify(param)}`;
}

function pruneCacheIfNeeded() {
  while (responseCache.size > apiCacheConfig.maxEntries) {
    const oldestKey = responseCache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    responseCache.delete(oldestKey);
  }
}

export function setApiCacheConfig(
  options: Partial<
    Pick<ApiCacheConfig, 'enabled' | 'defaultTtlMs' | 'maxEntries'>
  > & { isCacheable?: ApiCacheConfig['isCacheable'] }
) {
  if (typeof options.enabled === 'boolean')
    apiCacheConfig.enabled = options.enabled;
  if (typeof options.defaultTtlMs === 'number' && options.defaultTtlMs > 0) {
    apiCacheConfig.defaultTtlMs = options.defaultTtlMs;
  }
  if (typeof options.maxEntries === 'number' && options.maxEntries > 0) {
    apiCacheConfig.maxEntries = options.maxEntries;
  }
  if (typeof options.isCacheable === 'function') {
    apiCacheConfig.isCacheable = options.isCacheable;
  }
}

export function clearApiCache() {
  responseCache.clear();
  inflightRequests.clear();
}

export function invalidateApiCacheByFnPrefix(prefix: string) {
  const lookFor = `:${prefix}`;
  for (const key of Array.from(responseCache.keys())) {
    if (key.includes(lookFor)) {
      responseCache.delete(key);
    }
  }
}

export function setFunctionCacheTtl(fnName: string, ttlMs: number) {
  if (typeof ttlMs === 'number' && ttlMs > 0) {
    functionTtlOverride.set(fnName, ttlMs);
  } else {
    functionTtlOverride.delete(fnName);
  }
}

function invalidateRelatedCaches(fnName: string) {
  if (/^(create|update|delete)/i.test(fnName)) {
    clearApiCache();
  }
}

// Helper to call a named callable function and return its .data
async function call<T = any>(fnName: string, payload: unknown): Promise<T> {
  const callable = httpsCallable(functions, fnName);
  const param = payload === undefined ? {} : payload;
  const cacheable =
    apiCacheConfig.enabled && apiCacheConfig.isCacheable(fnName);

  // Cacheable read path with request de-duplication
  if (cacheable) {
    const key = makeCacheKey(fnName, param);
    const now = Date.now();
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > now) {
      // LRU touch
      responseCache.delete(key);
      responseCache.set(key, cached);
      return cached.value as T;
    }

    const existing = inflightRequests.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const requestPromise = (async () => {
      try {
        const res = await callable(param as any);
        const value = res.data as T;
        const maybeObj = value as unknown as Record<string, unknown> | null;
        const hasSuccess = maybeObj && typeof maybeObj['success'] === 'boolean';
        const issuesMsg = extractIssuesMessage(
          (maybeObj?.['issues'] as FieldIssue[] | undefined) ?? undefined
        );
        if (
          hasSuccess &&
          maybeObj &&
          (maybeObj['success'] as boolean) === false
        ) {
          const message = issuesMsg ?? `Failed to ${toSpacedWords(fnName)}`;
          if (globalToastService) globalToastService.error(message);
          const error: any = new Error(message);
          (error as any).issues = maybeObj?.['issues'];
          throw error;
        }
        if (issuesMsg) {
          if (globalToastService) globalToastService.error(issuesMsg);
          const error: any = new Error(issuesMsg);
          (error as any).issues = maybeObj?.['issues'];
          throw error;
        }
        const ttl =
          functionTtlOverride.get(fnName) ?? apiCacheConfig.defaultTtlMs;
        responseCache.set(key, { value, expiresAt: now + ttl });
        pruneCacheIfNeeded();
        return value;
      } catch (err: any) {
        const error: any = new Error(
          `API ${fnName} failed: ${err?.message ?? err}`
        );
        error.code = err?.code;
        error.details = err?.details ?? err?.customData ?? null;
        if (globalToastService) {
          const base = toSpacedWords(fnName);
          const msg = err?.message ?? 'Unknown error';
          globalToastService.error(`Failed to ${base}: ${msg}`);
        }
        throw error;
      } finally {
        inflightRequests.delete(key);
      }
    })();

    inflightRequests.set(key, requestPromise);
    return requestPromise as Promise<T>;
  }

  // Non-cacheable (likely mutations). Execute, validate result, toast, and invalidate related caches.
  try {
    const res = await callable(param as any);
    const data = res.data as any;
    const hasSuccess = data && typeof data.success === 'boolean';
    const issuesMsg = extractIssuesMessage(
      data?.issues as FieldIssue[] | undefined
    );
    if (hasSuccess && data.success === false) {
      const message = issuesMsg ?? `Failed to ${toSpacedWords(fnName)}`;
      if (globalToastService) globalToastService.error(message);
      const error: any = new Error(message);
      (error as any).issues = data?.issues;
      throw error;
    }
    if (issuesMsg) {
      if (globalToastService) globalToastService.error(issuesMsg);
      const error: any = new Error(issuesMsg);
      (error as any).issues = data?.issues;
      throw error;
    }
    // Success mutation toast
    if (globalToastService && /^(create|update|delete)/i.test(fnName)) {
      globalToastService.success(successMutationMessage(fnName));
    }
    // Targeted invalidation for related read endpoints
    invalidateRelatedCaches(fnName);
    return data as T;
  } catch (err: any) {
    const error: any = new Error(
      `API ${fnName} failed: ${err?.message ?? err}`
    );
    error.code = err?.code;
    error.details = err?.details ?? err?.customData ?? null;
    if (globalToastService) {
      const base = toSpacedWords(fnName);
      const msg = err?.message ?? 'Unknown error';
      globalToastService.error(`Failed to ${base}: ${msg}`);
    }
    throw error;
  }
}

// --- Types ---
export interface SendEmailPayload {
  email: string;
  subject: string;
  body: string;
}
export interface GetCallerIdentityPayload {}
export interface CreateAdminPayload {
  qid: string;
  name: Multilingual;
  dateOfBirth?: string | null;
  jobPosition?: string | null;
  email: string;
  password: string;
}
export interface GetAdminPayload {
  adminId?: string;
}
export interface UpdateAdminPayload {
  adminId?: string;
  qid: string;
  name: Multilingual;
  dateOfBirth?: string | null;
  jobPosition?: string | null;
}
export interface ChangeUserEmailPayload {
  newEmail: string;
}
export interface ChangeUserPhonePayload {
  newPhone: string;
}
export interface CheckServiceStatusPayload {
  email: string;
}
export interface EditUserInfoPayload {
  name: Multilingual;
  picture?: string;
}
export interface RegisterUserPayload {
  name: Multilingual;
  picture?: string | null;
}
export interface SendLoginAlertPayload {
  device?: string;
}
export interface SendPasswordResetPayload {
  email: string;
}
export interface SendVerificationEmailPayload {
  email: string;
}
export interface GetUserInfoByEmailPayload {
  email: string;
}
export interface GetProjectUsersPayload {
  projectId: string;
}
export interface getFormsByProjectPayload {
  projectId: string;
}
export interface CreateClientPayload {
  name: Multilingual;
  contactEmail: string;
  contactPhone: string;
  company: Multilingual;
  logo?: string;
  // status?: 'accepted' | 'rejected' | 'pending';
}
export interface AdminCreateClientPayload {
  name: Multilingual;
  contactEmail: string;
  contactPhone: string;
  password: string;
  logo?: string;
  company?: Multilingual | null;
}
export interface ApproveRejectClientPayload {
  clientId: string;
  approve: boolean;
}
export interface DeleteClientPayload {
  clientId: string;
}
export interface GetClientPayload {
  clientId: string;
}
export interface UpdateClientPayload {
  clientId: string;
  name: Multilingual;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  company?: Multilingual | null;
  status?: 'accepted' | 'rejected' | 'pending';
}

export interface CreateProjectUserRolePayload {
  userId?: string | null;
  projectId?: string | null;
  roleId?: string | null;
}
export interface UpdateProjectUserRolePayload {
  projectUserRoleId?: string | null;
  userId?: string | null;
  projectId?: string | null;
  roleId?: string | null;
}
export interface UpdateProjectUserRoleByUserAndProjectPayload {
  userId?: string | null;
  projectId?: string | null;
  roleId?: string | null;
}
export interface DeleteProjectUserRolePayload {
  projectUserRoleId?: string | null;
}
export interface DeleteProjectUserRoleByUserAndProjectPayload {
  userId?: string | null;
  projectId?: string | null;
}
export interface GetProjectUserRolePayload {
  projectUserRoleId?: string | null;
}
export interface GetProjectUserRolesByUserAndProjectPayload {
  userId?: string | null;
  projectId?: string | null;
}

export interface CreateFormPayload {
  projectId?: string | undefined | null;
  locationId?: string | undefined | null;
  formLanguage?: string | undefined;
  formTitle?: string | undefined;
}
export interface CreateQuestionsPayload {
  interviewId?: string;
  formId?: string;
  questions: {
    typeCode:
      | 'OPEN_ENDED'
      | 'SHORT_ANSWER'
      | 'NUMBER'
      | 'RATE'
      | 'DROPDOWN'
      | 'RADIO'
      | 'MULTIPLE_CHOICE';
    questionText: string;
    criteria?: {
      type:
        | 'equals'
        | 'greater_than'
        | 'less_than'
        | 'contains'
        | 'between'
        | 'not_equals'
        | 'greater_than_or_equal'
        | 'less_than_or_equal';
      value: string;
      effect: 'PASS' | 'FAIL';
    }[];
    options?: { optionText: string; isCorrect: boolean }[];
  }[];
}
export interface DeleteFormPayload {
  formId?: string | null | undefined;
}
export interface GetFormPayload {
  formId?: string | null | undefined;
}
export interface UpdateFormPayload {
  formId?: string | null | undefined;
  projectId?: string | null | undefined;
  locationId?: string | null | undefined;
  formLanguage?: string | null | undefined;
  formTitle?: string | null | undefined;
}
export interface GetFormByUserPayload {
  userId?: string | null;
}
export interface GetFormsByClientPayload {}
export interface CreateQuestionPayload {
  typeCode:
    | 'OPEN_ENDED'
    | 'SHORT_ANSWER'
    | 'NUMBER'
    | 'RATE'
    | 'DROPDOWN'
    | 'RADIO'
    | 'MULTIPLE_CHOICE';
  questionText: string;
  formId: string;
  interviewId: string;
}
export interface DeleteQuestionPayload {
  questionId: string;
}
export interface GetQuestionPayload {
  questionId: string;
}
export interface UpdateQuestionPayload {
  questionId: string;
  typeCode:
    | 'OPEN_ENDED'
    | 'SHORT_ANSWER'
    | 'NUMBER'
    | 'RATE'
    | 'DROPDOWN'
    | 'RADIO'
    | 'MULTIPLE_CHOICE';
  questionText: string;
}
export interface GetInterviewQuestionsPayload {
  interviewId: string;
}
export interface CreateSubmissionPayload {
  formId?: string;
  interviewId?: string;
  outcome?: string;
  decisionNotes?: string;
}
export interface DeleteSubmissionPayload {
  submissionId?: string;
}
export interface GetSubmissionPayload {
  submissionId?: string;
}
export interface UpdateSubmissionPayload {
  submissionId: string;
  formId?: string;
  userId?: string;
  interviewId?: string;
  outcome?: 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW';
  decisionNotes?: string | undefined;
}
export interface GetManualByFormIdPayload {
  formId: string;
  projectId: string;
}
export interface CreateSubmissionWithAnswerPayload {
  formId?: string;
  interviewId?: string;
  outcome?: string;
  decisionNotes?: string;
  questionId?: string;
  answerType?: 'text' | 'rating' | 'numeric' | 'options';
  textResponse?: string;
  rating?: number;
  numericResponse?: number;
  optionIds?: string[];
}
export interface CreateSubmissionWithAnswersPayload {
  formId?: string;
  interviewId?: string;
  userId?: string;
  outcome?: string;
  decisionNotes?: string;
  answers: {
    questionId?: string;
    answerType?: 'text' | 'rating' | 'numeric' | 'options';
    textResponse?: string;
    rating?: number;
    numericResponse?: number;
    optionIds?: string[];
  }[];
}
export interface GetManualAnswersBySubmissionIdPayload {
  submissionId: string;
  projectId: string;
}
export interface GetSubmissionsByFormPayload {
  formId: string;
  projectId: string;
}
export interface GetAnswersBySubmissionIdPayload {
  submissionId: string;
  projectId: string;
}
export interface UpdateSubmissionStatusPayload {
  submissionId: string;
  outcome: string;
  decisionNotes?: string;
  projectId: string;
}
export interface GetQuestionAnswersBySubmissionPayload {
  submissionId: string;
  projectId: string;
}
export interface CreateInterviewPayload {
  projectId: string;
  title: string;
}
export interface UpdateInterviewPayload {
  interviewId: string;
  projectId: string;
}
export interface GetInterviewPayload {
  interviewId: string;
}
export interface GetInterviewByProjectPayload {
  projectId: string;
}
export interface DeleteInterviewPayload {
  interviewId: string;
}

export interface CreateProjectPayload {
  name: Multilingual;
  startingDate: string;
  badgeBackground?: string;
  endingDate: string;
  description?: Multilingual | null;
}
export interface DeleteProjectPayload {
  projectId: string;
}
export interface GetProjectPayload {
  projectId: string;
}
export interface UpdateProjectPayload {
  projectId: string;
  name: Multilingual;
  startingDate: string;
  badgeBackground?: string;
  endingDate?: string;
  description?: Multilingual | null;
}
export interface getProjectsByClientPayload {}

export interface CreateLocationPayload {
  name: Multilingual;
  projectId: string;
  siteMap?: string;
  longitude: number;
  latitude: number;
}
export interface DeleteLocationPayload {
  clientId: string;
  locationId: string;
}
export interface GetLocationPayload {
  locationId: string;
}
export interface UpdateLocationPayload {
  locationId: string;
  name: Multilingual;
  projectId?: string;
  siteMap?: string;
  longitude?: number;
  latitude?: number;
}

export interface CreateUserProjectPayload {
  userId: string;
  projectId: string;
}
export interface DeleteUserProjectPayload {
  userProjectId: string;
}
export interface GetUserProjectPayload {
  userProjectId: string;
}
export interface UpdateUserProjectPayload {
  userProjectId: string;
  userId: string;
  projectId: string;
}

export interface CreateSchedulePayload {
  startTime: string;
  endTime: string;
  projectId?: string;
  locationId?: string;
}
export interface DeleteSchedulePayload {
  scheduleId: string;
}
export interface GetSchedulePayload {
  scheduleId: string;
}
export interface UpdateSchedulePayload {
  scheduleId: string;
  startTime?: string;
  endTime?: string;
  projectId?: string;
  locationId?: string;
}
export interface GetSchedulesByProjectOrLocationPayload {
  projectId?: string | undefined;
  locationId?: string | undefined;
}

export interface CreateUserSchedulePayload {
  userId: string;
  projectId: string;
  startTime: string;
  endTime: string;
  locationId: string;
}
export interface UpdateUserSchedulePayload {
  userProjectId: string;
  userId: string;
  projectId: string;
  scheduleId: string;
  startTime: string;
  endTime: string;
  locationId: string;
}

export interface CreateAttendancePayload {
  signedWith: 'BARCODE' | 'MANUAL';
  userId: string;
  areaId: string;
  timestamp?: string | null;
}
export interface DeleteAttendancePayload {
  attendanceId: string;
}
export interface GetAttendancePayload {
  attendanceId: string;
}
export interface UpdateAttendancePayload {
  attendanceId: string;
  timestamp?: string | null;
  userId?: string | null;
  areaId?: string | null;
  signedWith?: 'BARCODE' | 'MANUAL';
}
export interface GetAttendancesByProjectPayload {
  projectId: string;
}
export interface GetUserAttendancesByProjectPayload {
  projectId: string;
}

export interface CreateAreaPayload {
  name: Multilingual;
  locationId: string;
}
export interface DeleteAreaPayload {
  areaId: string;
}
export interface GetAreaPayload {
  areaId: string;
}
export interface UpdateAreaPayload {
  areaId: string;
  name: Multilingual;
  locationId: string;
}
export interface GetAreasByLocationPayload {
  locationId: string;
}
export interface GetSchedulesByLocationPayload {
  locationId: string;
}
// (duplicate removed) GetSchedulesByProjectOrLocationPayload is declared above
export interface GetAllFormQuestionsPayload {
  formId: string;
}
export interface GetEmailsByFormPayload {
  formId: string;
}

// --- Functions ---
export interface getProjectInfoByIdPayload {
  projectId: string;
}
// Admin functions
export async function sendEmail(payload: SendEmailPayload) {
  return call('sendEmail', payload);
}
export async function createAdmin(payload: CreateAdminPayload) {
  return call('createAdmin', payload);
}
export async function getAdmin(payload?: GetAdminPayload) {
  return call('getAdmin', payload ?? {});
}
export async function getAllAdmins() {
  return call('getAllAdmins', {});
}
export async function updateAdmin(payload: UpdateAdminPayload) {
  return call('updateAdmin', payload);
}

// User functions

export async function changeUserEmail(payload: ChangeUserEmailPayload) {
  return call('changeUserEmail', payload);
}
export async function changeUserPhone(payload: ChangeUserPhonePayload) {
  return call('changeUserPhone', payload);
}
export async function checkServiceStatus(payload: CheckServiceStatusPayload) {
  return call('checkServiceStatus', payload);
}
export async function editUserInfo(payload: EditUserInfoPayload) {
  return call('editUserInfo', payload);
}
export async function getUserInfo() {
  return call('getUserInfo', {});
}
export async function registerUser(payload: RegisterUserPayload) {
  return call('registerUser', payload);
}
export async function sendLoginAlert(payload?: SendLoginAlertPayload) {
  return call('sendLoginAlert', payload ?? {});
}
export async function sendPasswordReset(payload: SendPasswordResetPayload) {
  return call('sendPasswordReset', payload);
}
export async function sendVerificationEmail(
  payload: SendVerificationEmailPayload
) {
  return call('sendVerificationEmail', payload);
}
export async function getProjectUsers(payload: GetProjectUsersPayload) {
  return call('getProjectUsers', payload);
}
export async function getFormsByProject(payload: getFormsByProjectPayload) {
  return call('getFormsByProject', payload);
}
export async function getFormsByClient(payload: GetFormsByClientPayload) {
  return call('getFormsByClient', payload);
}
export async function getUserInfoByEmail(payload: GetUserInfoByEmailPayload) {
  return call('getUserInfoByEmail', payload);
}
export async function getCallerIdentity() {
  return call('getCallerIdentity', {});
}

// Client functions
export async function createClient(payload: CreateClientPayload) {
  return call('createClient', payload);
}
export async function adminCreateClient(payload: AdminCreateClientPayload) {
  return call('adminCreateClient', payload);
}
export async function approveRejectClient(payload: ApproveRejectClientPayload) {
  return call('approveRejectClient', payload);
}
export async function deleteClient(payload: DeleteClientPayload) {
  return call('deleteClient', payload);
}
export async function getAllClients() {
  return call('getAllClients', {});
}
export async function getClient(payload: GetClientPayload) {
  return call('getClient', payload);
}
export async function updateClient(payload: UpdateClientPayload) {
  return call('updateClient', payload);
}

// ProjectUserRole functions
export async function createProjectUserRole(
  payload: CreateProjectUserRolePayload = {}
) {
  return call('createProjectUserRole', payload);
}
export async function updateProjectUserRole(
  payload: UpdateProjectUserRolePayload = {}
) {
  return call('updateProjectUserRole', payload);
}
export async function updateProjectUserRoleByUserAndProject(
  payload: UpdateProjectUserRoleByUserAndProjectPayload = {}
) {
  return call('updateProjectUserRoleByUserAndProject', payload);
}
export async function deleteProjectUserRole(
  payload: DeleteProjectUserRolePayload = {}
) {
  return call('deleteProjectUserRole', payload);
}
export async function deleteProjectUserRoleByUserAndProject(
  payload: DeleteProjectUserRoleByUserAndProjectPayload = {}
) {
  return call('deleteProjectUserRolesByUserAndProject', payload);
}
export async function getProjectUserRole(
  payload: GetProjectUserRolePayload = {}
) {
  return call('getProjectUserRole', payload);
}
export async function getAllProjectUserRoles() {
  return call('getAllProjectUserRoles', {});
}
export async function getProjectUserRolesByUserAndProject(
  payload: GetProjectUserRolesByUserAndProjectPayload = {}
) {
  return call('getProjectUserRolesByUserAndProject', payload);
}

// Form / Question functions

export async function getAllFormQuestions(payload: GetAllFormQuestionsPayload) {
  return call('getAllFormQuestions', payload);
}
export async function getEmailsByForm(payload: GetEmailsByFormPayload) {
  return call('getEmailsByForm', payload);
}
export async function createForm(payload: CreateFormPayload = {}) {
  return call('createForm', payload);
}
export async function createQuestions(payload: CreateQuestionsPayload) {
  return call('createQuestions', payload);
}
export async function deleteForm(payload: DeleteFormPayload = {}) {
  return call('deleteForm', payload);
}
export async function getForm(payload: GetFormPayload = {}) {
  return call('getForm', payload);
}
export async function updateForm(payload: UpdateFormPayload = {}) {
  return call('updateForm', payload);
}
export async function getFormByUser(payload: GetFormByUserPayload = {}) {
  return call('getFormByUser', payload);
}

export async function createQuestion(payload: CreateQuestionPayload) {
  return call('createQuestion', payload);
}
export async function deleteQuestion(payload: DeleteQuestionPayload) {
  return call('deleteQuestion', payload);
}
export async function getAllQuestions() {
  return call('getAllQuestions', {});
}
export async function getQuestion(payload: GetQuestionPayload) {
  return call('getQuestion', payload);
}
export async function updateQuestion(payload: UpdateQuestionPayload) {
  return call('updateQuestion', payload);
}
export async function getInterviewQuestions(
  payload: GetInterviewQuestionsPayload
) {
  return call('getInterviewQuestions', payload);
}

// Submission functions
export async function createSubmission(payload: CreateSubmissionPayload = {}) {
  return call('createSubmission', payload);
}
export async function createSubmissionWithAnswer(
  payload: CreateSubmissionWithAnswerPayload
) {
  return call('createSubmissionWithAnswer', payload);
}
export async function createSubmissionWithAnswers(
  payload: CreateSubmissionWithAnswersPayload
) {
  return call('createSubmissionWithAnswers', payload);
}
export async function deleteSubmission(payload: DeleteSubmissionPayload = {}) {
  return call('deleteSubmission', payload);
}
export async function getSubmission(payload: GetSubmissionPayload = {}) {
  return call('getSubmission', payload);
}
export async function updateSubmission(payload: UpdateSubmissionPayload) {
  return call('updateSubmission', payload);
}
export async function getManualByFormId(payload: GetManualByFormIdPayload) {
  return call('getManualByFormId', payload);
}
export async function getManualAnswersBySubmissionId(
  payload: GetManualAnswersBySubmissionIdPayload
) {
  return call('getManualAnswersBySubmissionId', payload);
}
export async function getSubmissionsByForm(
  payload: GetSubmissionsByFormPayload
) {
  return call('getSubmissionsByForm', payload);
}
export async function getAnswersBySubmissionId(
  payload: GetAnswersBySubmissionIdPayload
) {
  return call('getAnswersBySubmissionId', payload);
}
export async function updateSubmissionStatus(
  payload: UpdateSubmissionStatusPayload
) {
  return call('updateSubmissionStatus', payload);
}
export async function getQuestionAnswersBySubmission(
  payload: GetQuestionAnswersBySubmissionPayload
) {
  return call('getQuestionAnswersBySubmission', payload);
}

// Interview functions
export async function createInterview(payload: CreateInterviewPayload) {
  return call('createInterview', payload);
}
export async function updateInterview(payload: UpdateInterviewPayload) {
  return call('updateInterview', payload);
}
export async function getInterview(payload: GetInterviewPayload) {
  return call('getInterview', payload);
}
export async function getInterviewByProject(
  payload: GetInterviewByProjectPayload
) {
  return call('getInterviewByProject', payload);
}
export async function deleteInterview(payload: DeleteInterviewPayload) {
  return call('deleteInterview', payload);
}

// Project functions
export async function createProject(payload: CreateProjectPayload) {
  return call('createProject', payload);
}
export async function deleteProject(payload: DeleteProjectPayload) {
  return call('deleteProject', payload);
}
export async function getProject(payload: GetProjectPayload) {
  return call('getProject', payload);
}
export async function updateProject(payload: UpdateProjectPayload) {
  return call('updateProject', payload);
}
export async function getProjectsByClient(payload: getProjectsByClientPayload) {
  return call('getProjectsByClient', payload);
}
export async function getAllProjects() {
  return call('getAllProjects', {});
}
export async function getAllActiveProjects() {
  return call('getAllActiveProjects', {});
}
export async function getProjectInfoById(payload: getProjectInfoByIdPayload) {
  return call('getProjectInfoById', payload);
}

// Location functions
export async function createLocation(payload: CreateLocationPayload) {
  return call('createLocation', payload);
}
export async function deleteLocation(payload: DeleteLocationPayload) {
  return call('deleteLocation', payload);
}
export async function getLocation(payload: GetLocationPayload) {
  return call('getLocation', payload);
}
export async function getLocationsForClient() {
  return call('getLocationsForClient', {});
}
export async function updateLocation(payload: UpdateLocationPayload) {
  return call('updateLocation', payload);
}

// UserProject functions
export async function createUserProject(payload: CreateUserProjectPayload) {
  return call('createUserProject', payload);
}
export async function deleteUserProject(payload: DeleteUserProjectPayload) {
  return call('deleteUserProject', payload);
}
export async function getUserProject(payload: GetUserProjectPayload) {
  return call('getUserProject', payload);
}
export async function updateUserProject(payload: UpdateUserProjectPayload) {
  return call('updateUserProject', payload);
}

// Schedule functions
export async function createSchedule(payload: CreateSchedulePayload) {
  return call('createSchedule', payload);
}
export async function deleteSchedule(payload: DeleteSchedulePayload) {
  return call('deleteSchedule', payload);
}
export async function getSchedule(payload: GetSchedulePayload) {
  return call('getSchedule', payload);
}
export async function updateSchedule(payload: UpdateSchedulePayload) {
  return call('updateSchedule', payload);
}
export async function getSchedulesByLocation(
  payload: GetSchedulesByLocationPayload
) {
  return call('getSchedulesByLocation', payload);
}
export async function getSchedulesByProjectOrLocation(
  payload: GetSchedulesByProjectOrLocationPayload
) {
  return call('getSchedulesByProjectOrLocation', payload);
}

// UserSchedule functions
export async function createUserSchedule(payload: CreateUserSchedulePayload) {
  return call('createUserSchedule', payload);
}
export async function updateUserSchedule(payload: UpdateUserSchedulePayload) {
  return call('updateUserSchedule', payload);
}

// Attendance functions
export async function createAttendance(payload: CreateAttendancePayload) {
  return call('createAttendance', payload);
}
export async function deleteAttendance(payload: DeleteAttendancePayload) {
  return call('deleteAttendance', payload);
}
export async function getAttendance(payload: GetAttendancePayload) {
  return call('getAttendance', payload);
}
export async function updateAttendance(payload: UpdateAttendancePayload) {
  return call('updateAttendance', payload);
}
export async function getAttendancesByProject(
  payload: GetAttendancesByProjectPayload
) {
  return call('getAttendancesByProject', payload);
}
export async function getUserAttendancesByProject(
  payload: GetUserAttendancesByProjectPayload
) {
  return call('getUserAttendancesByProject', payload);
}

// Area functions
export async function createArea(payload: CreateAreaPayload) {
  return call('createArea', payload);
}
export async function deleteArea(payload: DeleteAreaPayload) {
  return call('deleteArea', payload);
}
export async function getArea(payload: GetAreaPayload) {
  return call('getArea', payload);
}
export async function updateArea(payload: UpdateAreaPayload) {
  return call('updateArea', payload);
}
export async function getAreasByLocation(payload: GetAreasByLocationPayload) {
  return call('getAreasByLocation', payload);
}
export async function getAllAreas() {
  return call('getAllAreas', {});
}

const api = {
  sendEmail,
  createAdmin,
  getAdmin,
  getAllAdmins,
  updateAdmin,
  getUserInfoByEmail,
  getCallerIdentity,
  changeUserEmail,
  changeUserPhone,
  checkServiceStatus,
  editUserInfo,
  getUserInfo,
  registerUser,
  sendLoginAlert,
  sendPasswordReset,
  sendVerificationEmail,
  getProjectUsers,
  getFormsByProject,
  getFormsByClient,
  createClient,
  adminCreateClient,
  approveRejectClient,
  deleteClient,
  getAllClients,
  getClient,
  updateClient,
  createProjectUserRole,
  updateProjectUserRole,
  updateProjectUserRoleByUserAndProject,
  deleteProjectUserRole,
  deleteProjectUserRoleByUserAndProject,
  getProjectUserRole,
  getAllProjectUserRoles,
  getProjectUserRolesByUserAndProject,
  createForm,
  createQuestions,
  deleteForm,
  getForm,
  updateForm,
  getFormByUser,
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getAllFormQuestions,
  getEmailsByForm,
  getQuestion,
  updateQuestion,
  getInterviewQuestions,
  createSubmission,
  createSubmissionWithAnswer,
  createSubmissionWithAnswers,
  deleteSubmission,
  getSubmission,
  updateSubmission,
  getManualByFormId,
  getManualAnswersBySubmissionId,
  getSubmissionsByForm,
  getAnswersBySubmissionId,
  updateSubmissionStatus,
  getQuestionAnswersBySubmission,
  createInterview,
  updateInterview,
  getInterview,
  getInterviewByProject,
  deleteInterview,
  createProject,
  deleteProject,
  getProject,
  updateProject,
  getProjectsByClient,
  getAllProjects,
  getAllActiveProjects,
  getProjectInfoById,
  createLocation,
  deleteLocation,
  getLocation,
  updateLocation,
  createUserProject,
  deleteUserProject,
  getUserProject,
  updateUserProject,
  createSchedule,
  deleteSchedule,
  getSchedule,
  updateSchedule,
  getSchedulesByLocation,
  getSchedulesByProjectOrLocation,
  createUserSchedule,
  updateUserSchedule,
  createAttendance,
  deleteAttendance,
  getAttendance,
  updateAttendance,
  getAttendancesByProject,
  getUserAttendancesByProject,
  createArea,
  deleteArea,
  getArea,
  updateArea,
  getAreasByLocation,
  getAllAreas,
  getLocationsForClient,
  // cache controls
  setApiCacheConfig,
  clearApiCache,
  invalidateApiCacheByFnPrefix,
  setFunctionCacheTtl,
  setApiToastService,
};

export default api;
