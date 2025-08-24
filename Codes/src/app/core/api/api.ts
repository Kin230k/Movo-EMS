// app/core/api/api.ts
// Auto-generated API client that always uses POST and sends Firebase Auth token in Authorization header when available.

import { getAuth } from 'firebase/auth';

export type Multilingual = { en: string; ar: string };

let BASE_URL = '/api';

export function setBaseUrl(url: string) {
  BASE_URL = url.replace(/\/$/, '');
}

/**
 * Try to get current user's ID token. If no user is signed in (or token fetch fails), return undefined.
 * We do NOT throw here because server handlers should handle missing auth.
 */
async function getIdTokenIfAvailable(): Promise<string | undefined> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return undefined;
  try {
    return await user.getIdToken();
  } catch (e) {
    return undefined;
  }
}

async function post(fnName: string, payload: unknown): Promise<any> {
  const url = `${BASE_URL}/${fnName}`;
  const token = await getIdTokenIfAvailable();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: payload }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error(`Invalid JSON response from ${url}: ${text}`);
  }

  if (!res.ok) {
    const err = new Error(
      `API ${fnName} failed: ${res.status} ${res.statusText}`
    );
    (err as any).body = json;
    throw err;
  }

  return json;
}

// --- Types ---
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
  twoFaEnabled: boolean;
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
export interface CreateClientPayload {
  name: Multilingual;
  contactEmail: string;
  contactPhone: string;
  company: Multilingual;
  logo?: string;
  status?: 'accepted' | 'rejected' | 'pending';
}
export interface ApproveRejectClientPayload {
  clientId: string;
  approve: boolean;
}
export interface DeleteClientPayload {
  clientId: string;
}
export interface UpdateClientPayload {
  clientId: string;
  name: Multilingual;
  contactEmail: string;
  contactPhone: string;
  firebaseUid: string;
  logo?: string;
  company?: Multilingual | null;
  status?: 'accepted' | 'rejected' | 'pending';
}
export interface CreateFormPayload {
  projectId?: string | null;
  locationId?: string | null;
}
export interface CreateQuestionPayload {
  typeCode: string;
  questionText: Multilingual;
  formId: string;
  interviewId: string;
}
export interface DeleteQuestionPayload {
  questionId: string;
}
export interface GetQuestionPayload {
  questionId: string;
}
export interface CreateSubmissionPayload {
  formId?: string;
  interviewId?: string;
  dateSubmitted?: string;
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
  formId: string;
  userId: string;
  interviewId: string;
  dateSubmitted: Date;
  outcome?: 'pass' | 'fail' | 'manual_review';
  decisionNotes?: string;
}
export interface GetFormPayload {
  formId?: string | null;
  projectId?: string;
}
export interface UpdateFormPayload {
  formId?: string | null;
  projectId?: string | null;
  locationId?: string | null;
  name?: Multilingual;
  startingDate?: string;
  endingDate?: string;
  badgeBackground?: string;
  description?: Multilingual | null;
}

// --- 37 exported functions ---

// 1
export async function createAdmin(payload: CreateAdminPayload) {
  return post('createAdmin', payload);
}
// 2
export async function getAdmin(payload?: GetAdminPayload) {
  return post('getAdmin', payload ?? {});
}
// 3
export async function getAllAdmins() {
  return post('getAllAdmins', {});
}
// 4
export async function updateAdmin(payload: UpdateAdminPayload) {
  return post('updateAdmin', payload);
}
// 5
export async function changeUserEmail(payload: ChangeUserEmailPayload) {
  return post('changeUserEmail', payload);
}
// 6
export async function changeUserPhone(payload: ChangeUserPhonePayload) {
  return post('changeUserPhone', payload);
}
// 7
export async function checkServiceStatus(payload: CheckServiceStatusPayload) {
  return post('checkServiceStatus', payload);
}
// 8
export async function editUserInfo(payload: EditUserInfoPayload) {
  return post('editUserInfo', payload);
}
// 9
export async function getUserInfo() {
  return post('getUserInfo', {});
}
// 10
export async function registerUser(payload: RegisterUserPayload) {
  return post('registerUser', payload);
}
// 11
export async function sendLoginAlert(payload?: SendLoginAlertPayload) {
  return post('sendLoginAlert', payload ?? {});
}
// 12
export async function sendPasswordReset(payload: SendPasswordResetPayload) {
  return post('sendPasswordReset', payload);
}
// 13
export async function sendVerificationEmail(
  payload: SendVerificationEmailPayload
) {
  return post('sendVerificationEmail', payload);
}

// Clients
// 14
export async function createClient(payload: CreateClientPayload) {
  return post('createClient', payload);
}
// 15
export async function approveRejectClient(payload: ApproveRejectClientPayload) {
  return post('approveRejectClient', payload);
}
// 16
export async function deleteClient(payload: DeleteClientPayload) {
  return post('deleteClient', payload);
}
// 17
export async function getAllClients() {
  return post('getAllClients', {});
}
// 18
export async function getClient(payload: { clientId: string }) {
  return post('getClient', payload);
}
// 19
export async function updateClient(payload: UpdateClientPayload) {
  return post('updateClient', payload);
}

// Forms / Form variants
// 20 (first createForm variant: accepts optional projectId & locationId)
export async function createForm(payload?: CreateFormPayload) {
  return post('createForm', payload ?? {});
}
// 21 createForm variant 2 (no parameters entry in the JSON)
export async function createForm_variant2() {
  return post('createForm', {});
}
// 22 createFormWithQuestions
export async function createFormWithQuestions(payload?: unknown) {
  return post('createFormWithQuestions', payload ?? {});
}
// 23 deleteForm (first occurrence)
export async function deleteForm(payload?: unknown) {
  return post('deleteForm', payload ?? {});
}
// 24 deleteForm variant 2 (second identical entry mapped to distinct function)
export async function deleteForm_variant2() {
  return post('deleteForm', {});
}
// 25 getForm (variant that accepts formId?)
export async function getForm(payload?: GetFormPayload) {
  return post('getForm', payload ?? {});
}
// 26 getForm variant 2 (projectId required in the other JSON entry)
export async function getForm_byProject(payload: { projectId: string }) {
  return post('getForm', payload);
}
// 27 updateForm (variant with optional formId/projectId/locationId)
export async function updateForm(payload: UpdateFormPayload) {
  return post('updateForm', payload);
}
// 28 updateForm variant 2 (projectId + name + startingDate required variant)
export async function updateForm_variant2(payload: {
  projectId: string;
  name: Multilingual;
  startingDate: string;
  badgeBackground?: string;
  endingDate?: string;
  description?: Multilingual | null;
}) {
  return post('updateForm', payload);
}

// Questions
// 29
export async function createQuestion(payload: CreateQuestionPayload) {
  return post('createQuestion', payload);
}
// 30
export async function deleteQuestion(payload: DeleteQuestionPayload) {
  return post('deleteQuestion', payload);
}
// 31
export async function getAllQuestions() {
  return post('getAllQuestions', {});
}
// 32
export async function getQuestion(payload: GetQuestionPayload) {
  return post('getQuestion', payload);
}
// 33
export async function updateQuestion(payload?: unknown) {
  return post('updateQuestion', payload ?? {});
}

// Submissions
// 34
export async function createSubmission(payload?: CreateSubmissionPayload) {
  return post('createSubmission', payload ?? {});
}
// 35
export async function deleteSubmission(payload?: DeleteSubmissionPayload) {
  return post('deleteSubmission', payload ?? {});
}
// 36
export async function getSubmission(payload?: GetSubmissionPayload) {
  return post('getSubmission', payload ?? {});
}
// 37
export async function updateSubmission(payload: UpdateSubmissionPayload) {
  return post('updateSubmission', payload);
}

// default export object containing all functions (including variant names)
const api = {
  createAdmin,
  getAdmin,
  getAllAdmins,
  updateAdmin,
  changeUserEmail,
  changeUserPhone,
  checkServiceStatus,
  editUserInfo,
  getUserInfo,
  registerUser,
  sendLoginAlert,
  sendPasswordReset,
  sendVerificationEmail,
  createClient,
  approveRejectClient,
  deleteClient,
  getAllClients,
  getClient,
  updateClient,
  createForm,
  createForm_variant2,
  createFormWithQuestions,
  deleteForm,
  deleteForm_variant2,
  getForm,
  getForm_byProject,
  updateForm,
  updateForm_variant2,
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  createSubmission,
  deleteSubmission,
  getSubmission,
  updateSubmission,
};

export default api;
