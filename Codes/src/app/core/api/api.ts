// app/core/api/api.ts
// Auto-generated API client that always uses POST and sends Firebase Auth token in Authorization header when available.

import { getAuth } from 'firebase/auth';

export type Multilingual = { en: string; ar: string };

let BASE_URL = '/api';

export function setBaseUrl(url: string) {
  BASE_URL = url.replace(/\/$/, '');
}

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
export interface GetProjectUsersPayload {
  projectId: string;
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
export interface DeleteProjectUserRolePayload {
  projectUserRoleId?: string | null;
}
export interface GetProjectUserRolePayload {
  projectUserRoleId?: string | null;
}
export interface GetProjectUserRolesByUserAndProjectPayload {
  userId?: string | null;
  projectId?: string | null;
}
export interface CreateFormPayload {
  projectId?: string | null;
  locationId?: string | null;
}
export interface CreateFormWithQuestionsPayload {
  projectId?: string | null;
  locationId?: string | null;
  questions?:
    | {
        typeCode: string;
        questionText: Multilingual;
        interviewId: string;
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
        }[];
      }[]
    | null;
}
export interface DeleteFormPayload {
  formId?: string | null;
}
export interface GetFormPayload {
  formId?: string | null;
}
export interface UpdateFormPayload {
  formId?: string | null;
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
export interface UpdateQuestionPayload {
  questionId: string;
  typeCode: string;
  questionText: Multilingual;
  formId: string;
  interviewId: string;
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
export interface CreateInterviewPayload {
  projectId: string;
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
  clientId: string;
  name: Multilingual;
  startingDate: string;
  badgeBackground?: string;
  endingDate?: string;
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
export interface GetProjectByClientPayload {
  clientId: string;
}
export interface CreateLocationPayload {
  clientId: string;
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
  clientId: string;
  locationId: string;
  name: Multilingual;
  projectId: string;
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
  projectId: string;
  locationId: string;
}
export interface DeleteSchedulePayload {
  scheduleId: string;
}
export interface GetSchedulePayload {
  scheduleId: string;
}
export interface UpdateSchedulePayload {
  scheduleId: string;
  startTime: string;
  endTime: string;
  projectId: string;
  locationId: string;
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
  timestamp?: string | null;
  signedWith: 'QR_CODE' | 'MANUAL';
  signedBy: string;
  userId: string;
  areaId: string;
}
export interface DeleteAttendancePayload {
  attendanceId: string;
}
export interface GetAttendancePayload {
  attendanceId: string;
}
export interface UpdateAttendancePayload {
  attendanceId: string;
  signedWith: 'QR_CODE' | 'MANUAL';
  timestamp?: string | null;
  signedBy?: string | null;
  userId?: string | null;
  areaId?: string | null;
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

// --- Functions ---

// Admin functions
export async function createAdmin(payload: CreateAdminPayload) {
  return post('createAdmin', payload);
}
export async function getAdmin(payload?: GetAdminPayload) {
  return post('getAdmin', payload ?? {});
}
export async function getAllAdmins() {
  return post('getAllAdmins', {});
}
export async function updateAdmin(payload: UpdateAdminPayload) {
  return post('updateAdmin', payload);
}

// User functions
export async function changeUserEmail(payload: ChangeUserEmailPayload) {
  return post('changeUserEmail', payload);
}
export async function changeUserPhone(payload: ChangeUserPhonePayload) {
  return post('changeUserPhone', payload);
}
export async function checkServiceStatus(payload: CheckServiceStatusPayload) {
  return post('checkServiceStatus', payload);
}
export async function editUserInfo(payload: EditUserInfoPayload) {
  return post('editUserInfo', payload);
}
export async function getUserInfo() {
  return post('getUserInfo', {});
}
export async function registerUser(payload: RegisterUserPayload) {
  return post('registerUser', payload);
}
export async function sendLoginAlert(payload?: SendLoginAlertPayload) {
  return post('sendLoginAlert', payload ?? {});
}
export async function sendPasswordReset(payload: SendPasswordResetPayload) {
  return post('sendPasswordReset', payload);
}
export async function sendVerificationEmail(
  payload: SendVerificationEmailPayload
) {
  return post('sendVerificationEmail', payload);
}
export async function getProjectUsers(payload: GetProjectUsersPayload) {
  return post('getProjectUsers', payload);
}

// Client functions
export async function createClient(payload: CreateClientPayload) {
  return post('createClient', payload);
}
export async function approveRejectClient(payload: ApproveRejectClientPayload) {
  return post('approveRejectClient', payload);
}
export async function deleteClient(payload: DeleteClientPayload) {
  return post('deleteClient', payload);
}
export async function getAllClients() {
  return post('getAllClients', {});
}
export async function getClient(payload: GetClientPayload) {
  return post('getClient', payload);
}
export async function updateClient(payload: UpdateClientPayload) {
  return post('updateClient', payload);
}

// ProjectUserRole functions
export async function createProjectUserRole(
  payload: CreateProjectUserRolePayload = {}
) {
  return post('createProjectUserRole', payload);
}
export async function updateProjectUserRole(
  payload: UpdateProjectUserRolePayload = {}
) {
  return post('updateProjectUserRole', payload);
}
export async function deleteProjectUserRole(
  payload: DeleteProjectUserRolePayload = {}
) {
  return post('deleteProjectUserRole', payload);
}
export async function getProjectUserRole(
  payload: GetProjectUserRolePayload = {}
) {
  return post('getProjectUserRole', payload);
}
export async function getAllProjectUserRoles() {
  return post('getAllProjectUserRoles', {});
}
export async function getProjectUserRolesByUserAndProject(
  payload: GetProjectUserRolesByUserAndProjectPayload = {}
) {
  return post('getProjectUserRolesByUserAndProject', payload);
}

// Form functions
export async function createForm(payload: CreateFormPayload = {}) {
  return post('createForm', payload);
}
export async function createFormWithQuestions(
  payload: CreateFormWithQuestionsPayload = {}
) {
  return post('createFormWithQuestions', payload);
}
export async function deleteForm(payload: DeleteFormPayload = {}) {
  return post('deleteForm', payload);
}
export async function getForm(payload: GetFormPayload = {}) {
  return post('getForm', payload);
}
export async function updateForm(payload: UpdateFormPayload = {}) {
  return post('updateForm', payload);
}

// Question functions
export async function createQuestion(payload: CreateQuestionPayload) {
  return post('createQuestion', payload);
}
export async function deleteQuestion(payload: DeleteQuestionPayload) {
  return post('deleteQuestion', payload);
}
export async function getAllQuestions() {
  return post('getAllQuestions', {});
}
export async function getQuestion(payload: GetQuestionPayload) {
  return post('getQuestion', payload);
}
export async function updateQuestion(payload: UpdateQuestionPayload) {
  return post('updateQuestion', payload);
}

// Submission functions
export async function createSubmission(payload: CreateSubmissionPayload = {}) {
  return post('createSubmission', payload);
}
export async function deleteSubmission(payload: DeleteSubmissionPayload = {}) {
  return post('deleteSubmission', payload);
}
export async function getSubmission(payload: GetSubmissionPayload = {}) {
  return post('getSubmission', payload);
}
export async function updateSubmission(payload: UpdateSubmissionPayload) {
  return post('updateSubmission', payload);
}

// Interview functions
export async function createInterview(payload: CreateInterviewPayload) {
  return post('createInterview', payload);
}
export async function updateInterview(payload: UpdateInterviewPayload) {
  return post('updateInterview', payload);
}
export async function getInterview(payload: GetInterviewPayload) {
  return post('getInterview', payload);
}
export async function getInterviewByProject(
  payload: GetInterviewByProjectPayload
) {
  return post('getInterviewByProject', payload);
}
export async function deleteInterview(payload: DeleteInterviewPayload) {
  return post('deleteInterview', payload);
}

// Project functions
export async function createProject(payload: CreateProjectPayload) {
  return post('createProject', payload);
}
export async function deleteProject(payload: DeleteProjectPayload) {
  return post('deleteProject', payload);
}
export async function getProject(payload: GetProjectPayload) {
  return post('getProject', payload);
}
export async function updateProject(payload: UpdateProjectPayload) {
  return post('updateProject', payload);
}
export async function getProjectByClient(payload: GetProjectByClientPayload) {
  return post('getProjectByClient', payload);
}

// Location functions
export async function createLocation(payload: CreateLocationPayload) {
  return post('createLocation', payload);
}
export async function deleteLocation(payload: DeleteLocationPayload) {
  return post('deleteLocation', payload);
}
export async function getLocation(payload: GetLocationPayload) {
  return post('getLocation', payload);
}
export async function updateLocation(payload: UpdateLocationPayload) {
  return post('updateLocation', payload);
}

// UserProject functions
export async function createUserProject(payload: CreateUserProjectPayload) {
  return post('createUserProject', payload);
}
export async function deleteUserProject(payload: DeleteUserProjectPayload) {
  return post('deleteUserProject', payload);
}
export async function getUserProject(payload: GetUserProjectPayload) {
  return post('getUserProject', payload);
}
export async function updateUserProject(payload: UpdateUserProjectPayload) {
  return post('updateUserProject', payload);
}

// Schedule functions
export async function createSchedule(payload: CreateSchedulePayload) {
  return post('createSchedule', payload);
}
export async function deleteSchedule(payload: DeleteSchedulePayload) {
  return post('deleteSchedule', payload);
}
export async function getSchedule(payload: GetSchedulePayload) {
  return post('getSchedule', payload);
}
export async function updateSchedule(payload: UpdateSchedulePayload) {
  return post('updateSchedule', payload);
}

// UserSchedule functions
export async function createUserSchedule(payload: CreateUserSchedulePayload) {
  return post('createUserSchedule', payload);
}
export async function updateUserSchedule(payload: UpdateUserSchedulePayload) {
  return post('updateUserSchedule', payload);
}

// Attendance functions
export async function createAttendance(payload: CreateAttendancePayload) {
  return post('createAttendance', payload);
}
export async function deleteAttendance(payload: DeleteAttendancePayload) {
  return post('deleteAttendance', payload);
}
export async function getAttendance(payload: GetAttendancePayload) {
  return post('getAttendance', payload);
}
export async function updateAttendance(payload: UpdateAttendancePayload) {
  return post('updateAttendance', payload);
}
export async function getAttendancesByProject(
  payload: GetAttendancesByProjectPayload
) {
  return post('getAttendancesByProject', payload);
}
export async function getUserAttendancesByProject(
  payload: GetUserAttendancesByProjectPayload
) {
  return post('getUserAttendancesByProject', payload);
}

// Area functions
export async function createArea(payload: CreateAreaPayload) {
  return post('createArea', payload);
}
export async function deleteArea(payload: DeleteAreaPayload) {
  return post('deleteArea', payload);
}
export async function getArea(payload: GetAreaPayload) {
  return post('getArea', payload);
}
export async function updateArea(payload: UpdateAreaPayload) {
  return post('updateArea', payload);
}
export async function getAreasByLocation(payload: GetAreasByLocationPayload) {
  return post('getAreasByLocation', payload);
}
export async function getAllAreas() {
  return post('getAllAreas', {});
}

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
  getProjectUsers,
  createClient,
  approveRejectClient,
  deleteClient,
  getAllClients,
  getClient,
  updateClient,
  createProjectUserRole,
  updateProjectUserRole,
  deleteProjectUserRole,
  getProjectUserRole,
  getAllProjectUserRoles,
  getProjectUserRolesByUserAndProject,
  createForm,
  createFormWithQuestions,
  deleteForm,
  getForm,
  updateForm,
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  createSubmission,
  deleteSubmission,
  getSubmission,
  updateSubmission,
  createInterview,
  updateInterview,
  getInterview,
  getInterviewByProject,
  deleteInterview,
  createProject,
  deleteProject,
  getProject,
  updateProject,
  getProjectByClient,
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
};

export default api;
