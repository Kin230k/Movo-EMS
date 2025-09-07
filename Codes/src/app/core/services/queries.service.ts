// src/app/core/services/api-queries.service.ts
import { Injectable } from '@angular/core';
import * as api from '../api/api';
import { GetAllFormQuestionsPayload } from '../api/api';

@Injectable({ providedIn: 'root' })
export class ApiQueriesService {
  constructor() {}

  // In-memory cache with TTL and inflight de-duplication
  private cache = new Map<
    string,
    { value: any; expiresAt: number; inflight?: Promise<any> }
  >();
  private defaultTtlMs = 2 * 60 * 1000; // 2 minutes

  private makeCacheKey(endpoint?: string, payload?: any): string | null {
    if (!endpoint) return null;
    try {
      const json = payload
        ? JSON.stringify(payload, Object.keys(payload).sort())
        : '';
      return `${endpoint}|${json}`;
    } catch {
      return `${endpoint}|${String(payload)}`;
    }
  }

  private getCached<T>(key: string | null): T | undefined {
    if (!key) return undefined;
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  private setCached<T>(key: string | null, value: T, ttlMs?: number) {
    if (!key) return;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  private getInflight(key: string | null) {
    if (!key) return undefined;
    return this.cache.get(key)?.inflight;
  }

  private setInflight(key: string | null, promise?: Promise<any>) {
    if (!key) return;
    const entry = this.cache.get(key) ?? { value: undefined, expiresAt: 0 };
    if (promise) entry.inflight = promise;
    else delete (entry as any).inflight;
    this.cache.set(key, entry);
  }

  private invalidate(prefix?: string) {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const k of Array.from(this.cache.keys()))
      if (k.startsWith(prefix)) this.cache.delete(k);
  }

  // Query adapter with optional caching and status flags
  private makeQuery<T>(
    fetcher: () => Promise<T>,
    endpoint?: string,
    payload?: any,
    ttlMs?: number
  ) {
    const key = this.makeCacheKey(endpoint, payload);
    const container: {
      value: T | undefined;
      loading: boolean;
      success: boolean;
      err: any | null;
    } = {
      value: this.getCached<T>(key),
      loading: false,
      success: false,
      err: null,
    };

    const startFetch = () => {
      container.loading = true;
      container.success = false;
      container.err = null;
      const p = fetcher()
        .then((res) => {
          this.setCached(key, res as any, ttlMs);
          container.value = res as any;
          container.success = true;
          return res;
        })
        .catch((e) => {
          container.err = e;
          container.success = false;
        })
        .finally(() => {
          container.loading = false;
          this.setInflight(key, undefined);
        });
      this.setInflight(key, p);
      return p;
    };

    if (container.value === undefined) {
      const inflight = this.getInflight(key);
      if (inflight)
        inflight
          .then((res) => (container.value = res as any))
          .catch((e) => (container.err = e));
      else startFetch();
    } else {
      container.success = true;
    }

    const adapter: any = {
      data: () => container.value,
      isLoading: () => container.loading,
      isSuccess: () => container.success,
      isError: () => !!container.err,
      error: () => container.err,
      refetch: () => startFetch(),
      reset: () => {
        container.loading = false;
        container.success = false;
        container.err = null;
      },
      // Make thenable so `await` waits for first fetch to complete
      then: (resolve: (v: any) => void, reject?: (e: any) => void) => {
        if (container.value !== undefined || container.err) {
          resolve(adapter);
          return;
        }
        startFetch()
          .then(() => resolve(adapter))
          .catch((e) => (reject ? reject(e) : resolve(adapter)));
      },
    };
    return adapter;
  }

  // Mutation adapter with cache invalidation and status flags
  private makeMutation<TPayload, TRes>(
    mutator: (payload: TPayload) => Promise<TRes>,
    invalidatePrefix?: string
  ) {
    const state = { pending: false, success: false, err: null as any };
    return {
      mutate: (
        payload: TPayload,
        opts?: { onSuccess?: (res: TRes) => void; onError?: (err: any) => void }
      ) => {
        state.pending = true;
        state.success = false;
        state.err = null;
        mutator(payload)
          .then((res) => {
            this.invalidate(invalidatePrefix);
            state.success = true;
            opts?.onSuccess?.(res);
          })
          .catch((err) => {
            state.err = err;
            state.success = false;
            opts?.onError?.(err);
          })
          .finally(() => {
            state.pending = false;
          });
      },
      mutateAsync: (payload: TPayload): Promise<TRes> => {
        state.pending = true;
        state.success = false;
        state.err = null;
        return mutator(payload)
          .then((res) => {
            this.invalidate(invalidatePrefix);
            state.success = true;
            return res;
          })
          .catch((err) => {
            state.err = err;
            state.success = false;
            throw err;
          })
          .finally(() => {
            state.pending = false;
          });
      },
      isPending: () => state.pending,
      isSuccess: () => state.success,
      isError: () => !!state.err,
      error: () => state.err,
      reset: () => {
        state.pending = false;
        state.success = false;
        state.err = null;
      },
    } as any;
  }
  // General
  sendEmailMutation() {
    return this.makeMutation(api.sendEmail, 'sendEmail');
  }

  getUserInfoByEmailQuery(payload: any) {
    return this.makeQuery(
      () => api.getUserInfoByEmail(payload),
      'getUserInfoByEmail',
      payload
    );
  }

  getCallerIdentityQuery() {
    return this.makeQuery(() => api.getCallerIdentity(), 'getCallerIdentity');
  }

  // Admin
  createAdminMutation() {
    return this.makeMutation(api.createAdmin, 'getAdmin');
  }
  getAdminQuery(payload?: any) {
    return this.makeQuery(() => api.getAdmin(payload), 'getAdmin', payload);
  }
  getAllAdminsQuery() {
    return this.makeQuery(() => api.getAllAdmins(), 'getAllAdmins');
  }
  updateAdminMutation() {
    return this.makeMutation(api.updateAdmin, 'getAdmin');
  }

  // User
  changeUserEmailMutation() {
    return this.makeMutation(api.changeUserEmail, 'getUserInfo');
  }
  changeUserPhoneMutation() {
    return this.makeMutation(api.changeUserPhone, 'getUserInfo');
  }
  checkServiceStatusQuery(payload: any) {
    return this.makeQuery(
      () => api.checkServiceStatus(payload),
      'checkServiceStatus',
      payload
    );
  }
  editUserInfoMutation() {
    return this.makeMutation(api.editUserInfo, 'getUserInfo');
  }
  getUserInfoQuery() {
    return this.makeQuery(() => api.getUserInfo(), 'getUserInfo');
  }
  registerUserMutation() {
    return this.makeMutation(api.registerUser, 'getUserInfo');
  }
  sendLoginAlertMutation() {
    return this.makeMutation(api.sendLoginAlert);
  }
  sendPasswordResetMutation() {
    return this.makeMutation(api.sendPasswordReset);
  }
  sendVerificationEmailMutation() {
    return this.makeMutation(api.sendVerificationEmail);
  }
  getProjectUsersQuery(payload: any) {
    return this.makeQuery(
      () => api.getProjectUsers(payload),
      'getProjectUsers',
      payload
    );
  }
  getFormsByProjectQuery(payload: any) {
    return this.makeQuery(
      () => api.getFormsByProject(payload),
      'getFormsByProject',
      payload
    );
  }

  // Clients
  createClientMutation() {
    return this.makeMutation(api.createClient, 'getAllClients');
  }
  adminCreateClientMutation() {
    return this.makeMutation(api.adminCreateClient, 'getAllClients');
  }
  approveRejectClientMutation() {
    return this.makeMutation(api.approveRejectClient, 'getClient');
  }
  deleteClientMutation() {
    return this.makeMutation(api.deleteClient, 'getAllClients');
  }
  getAllClientsQuery() {
    return this.makeQuery(() => api.getAllClients(), 'getAllClients');
  }
  getClientQuery(payload: any) {
    return this.makeQuery(() => api.getClient(payload), 'getClient', payload);
  }
  updateClientMutation() {
    return this.makeMutation(api.updateClient, 'getClient');
  }

  // ProjectUserRole
  createProjectUserRoleMutation() {
    return this.makeMutation(api.createProjectUserRole, 'getProjectUserRoles');
  }
  updateProjectUserRoleMutation() {
    return this.makeMutation(api.updateProjectUserRole, 'getProjectUserRoles');
  }
  deleteProjectUserRoleMutation() {
    return this.makeMutation(api.deleteProjectUserRole, 'getProjectUserRoles');
  }
  getProjectUserRoleQuery(payload?: any) {
    return this.makeQuery(
      () => api.getProjectUserRole(payload),
      'getProjectUserRole',
      payload
    );
  }
  getAllProjectUserRolesQuery() {
    return this.makeQuery(
      () => api.getAllProjectUserRoles(),
      'getAllProjectUserRoles'
    );
  }
  getProjectUserRolesByUserAndProjectQuery(payload?: any) {
    return this.makeQuery(
      () => api.getProjectUserRolesByUserAndProject(payload),
      'getProjectUserRolesByUserAndProject',
      payload
    );
  }

  // Forms
  createFormMutation() {
    return this.makeMutation(api.createForm, 'getForm');
  }
  createQuestionsMutation() {
    return this.makeMutation(api.createQuestions, 'getAllFormQuestions');
  }
  deleteFormMutation() {
    return this.makeMutation(api.deleteForm, 'getForm');
  }
  getFormQuery(payload?: any) {
    return this.makeQuery(() => api.getForm(payload), 'getForm', payload);
  }
  updateFormMutation() {
    return this.makeMutation(api.updateForm, 'getForm');
  }
  getFormByUserQuery(payload?: any) {
    return this.makeQuery(
      () => api.getFormByUser(payload),
      'getFormByUser',
      payload
    );
  }

  // Questions
  createQuestionMutation() {
    return this.makeMutation(api.createQuestion);
  }
  deleteQuestionMutation() {
    return this.makeMutation(api.deleteQuestion);
  }
  getAllQuestionsQuery() {
    return this.makeQuery(() => api.getAllQuestions(), 'getAllQuestions');
  }
  async getAllFormQuestionsQuery(payload: GetAllFormQuestionsPayload) {
    const q = await this.makeQuery(
      () => api.getAllFormQuestions(payload),
      'getAllFormQuestions',
      payload
    );

    return q;
  }

  getQuestionQuery(payload: any) {
    return this.makeQuery(
      () => api.getQuestion(payload),
      'getQuestion',
      payload
    );
  }
  updateQuestionMutation() {
    return this.makeMutation(api.updateQuestion);
  }
  getInterviewQuestionsQuery(payload: any) {
    return this.makeQuery(() => api.getInterviewQuestions(payload));
  }

  // Submissions
  createSubmissionMutation() {
    return this.makeMutation(api.createSubmission, 'getSubmissions');
  }
  createSubmissionWithAnswerMutation() {
    return this.makeMutation(api.createSubmissionWithAnswer, 'getSubmissions');
  }
  createSubmissionWithAnswersMutation() {
    return this.makeMutation(api.createSubmissionWithAnswers, 'getSubmissions');
  }
  deleteSubmissionMutation() {
    return this.makeMutation(api.deleteSubmission, 'getSubmissions');
  }
  getSubmissionQuery(payload?: any) {
    return this.makeQuery(
      () => api.getSubmission(payload),
      'getSubmission',
      payload
    );
  }
  updateSubmissionMutation() {
    return this.makeMutation(api.updateSubmission, 'getSubmission');
  }
  getManualByFormIdQuery(payload: any) {
    return this.makeQuery(
      () => api.getManualByFormId(payload),
      'getManualByFormId',
      payload
    );
  }
  getManualAnswersBySubmissionIdQuery(payload: any) {
    return this.makeQuery(
      () => api.getManualAnswersBySubmissionId(payload),
      'getManualAnswersBySubmissionId',
      payload
    );
  }
  getSubmissionsByFormQuery(payload: any) {
    return this.makeQuery(
      () => api.getSubmissionsByForm(payload),
      'getSubmissionsByForm',
      payload
    );
  }
  getAnswersBySubmissionIdQuery(payload: any) {
    return this.makeQuery(
      () => api.getAnswersBySubmissionId(payload),
      'getAnswersBySubmissionId',
      payload
    );
  }
  updateSubmissionStatusMutation() {
    return this.makeMutation(api.updateSubmissionStatus, 'getSubmissions');
  }
  getQuestionAnswersBySubmissionQuery(payload: any) {
    return this.makeQuery(
      () => api.getQuestionAnswersBySubmission(payload),
      'getQuestionAnswersBySubmission',
      payload
    );
  }

  // Interviews
  createInterviewMutation() {
    return this.makeMutation(api.createInterview, 'getInterview');
  }
  updateInterviewMutation() {
    return this.makeMutation(api.updateInterview, 'getInterview');
  }
  getInterviewQuery(payload: any) {
    return this.makeQuery(
      () => api.getInterview(payload),
      'getInterview',
      payload
    );
  }
  getInterviewByProjectQuery(payload: any) {
    return this.makeQuery(
      () => api.getInterviewByProject(payload),
      'getInterviewByProject',
      payload
    );
  }
  deleteInterviewMutation() {
    return this.makeMutation(api.deleteInterview, 'getInterviewByProject');
  }

  // Projects
  createProjectMutation() {
    return this.makeMutation(api.createProject, 'getAllProjects');
  }
  deleteProjectMutation() {
    return this.makeMutation(api.deleteProject, 'getAllProjects');
  }
  getProjectQuery(payload: any) {
    return this.makeQuery(() => api.getProject(payload), 'getProject', payload);
  }
  updateProjectMutation() {
    return this.makeMutation(api.updateProject, 'getProject');
  }
  getProjectsByClientQuery(payload: any) {
    return this.makeQuery(
      () => api.getProjectsByClient(payload),
      'getProjectsByClient',
      payload
    );
  }
  getProjectInfoByIdQuery(payload: any) {
    return this.makeQuery(
      () => api.getProjectInfoById(payload),
      'getProjectInfoById',
      payload
    );
  }
  getAllProjectsQuery() {
    return this.makeQuery(() => api.getAllProjects(), 'getAllProjects');
  }
  getAllActiveProjectsQuery() {
    return this.makeQuery(
      () => api.getAllActiveProjects(),
      'getAllActiveProjects'
    );
  }

  // Locations
  createLocationMutation() {
    return this.makeMutation(api.createLocation, 'getLocation');
  }
  deleteLocationMutation() {
    return this.makeMutation(api.deleteLocation, 'getLocation');
  }
  getLocationQuery(payload: any) {
    return this.makeQuery(
      () => api.getLocation(payload),
      'getLocation',
      payload
    );
  }
  updateLocationMutation() {
    return this.makeMutation(api.updateLocation, 'getLocation');
  }

  // UserProject
  createUserProjectMutation() {
    return this.makeMutation(api.createUserProject, 'getUserProject');
  }
  deleteUserProjectMutation() {
    return this.makeMutation(api.deleteUserProject, 'getUserProject');
  }
  getUserProjectQuery(payload: any) {
    return this.makeQuery(
      () => api.getUserProject(payload),
      'getUserProject',
      payload
    );
  }
  updateUserProjectMutation() {
    return this.makeMutation(api.updateUserProject, 'getUserProject');
  }

  // Schedule
  createScheduleMutation() {
    return this.makeMutation(api.createSchedule, 'getSchedule');
  }
  deleteScheduleMutation() {
    return this.makeMutation(api.deleteSchedule, 'getSchedule');
  }
  getScheduleQuery(payload: any) {
    return this.makeQuery(
      () => api.getSchedule(payload),
      'getSchedule',
      payload
    );
  }
  updateScheduleMutation() {
    return this.makeMutation(api.updateSchedule, 'getSchedule');
  }
  getSchedulesByProjectOrLocationQuery(payload: any) {
    return this.makeQuery(
      () => api.getSchedulesByProjectOrLocation(payload),
      'getSchedulesByProjectOrLocation',
      payload
    );
  }

  // UserSchedule
  createUserScheduleMutation() {
    return this.makeMutation(api.createUserSchedule, 'getUserProject');
  }
  updateUserScheduleMutation() {
    return this.makeMutation(api.updateUserSchedule, 'getUserProject');
  }

  // Attendance
  createAttendanceMutation() {
    return this.makeMutation(api.createAttendance, 'getAttendances');
  }
  deleteAttendanceMutation() {
    return this.makeMutation(api.deleteAttendance, 'getAttendances');
  }
  getAttendanceQuery(payload: any) {
    return this.makeQuery(
      () => api.getAttendance(payload),
      'getAttendance',
      payload
    );
  }
  updateAttendanceMutation() {
    return this.makeMutation(api.updateAttendance, 'getAttendance');
  }
  getAttendancesByProjectQuery(payload: any) {
    return this.makeQuery(
      () => api.getAttendancesByProject(payload),
      'getAttendancesByProject',
      payload
    );
  }
  getUserAttendancesByProjectQuery(payload: any) {
    return this.makeQuery(
      () => api.getUserAttendancesByProject(payload),
      'getUserAttendancesByProject',
      payload
    );
  }

  // Areas
  createAreaMutation() {
    return this.makeMutation(api.createArea, 'getAreas');
  }
  deleteAreaMutation() {
    return this.makeMutation(api.deleteArea, 'getAreas');
  }
  getAreaQuery(payload: any) {
    return this.makeQuery(() => api.getArea(payload), 'getArea', payload);
  }
  updateAreaMutation() {
    return this.makeMutation(api.updateArea, 'getArea');
  }
  getAreasByLocationQuery(payload: any) {
    return this.makeQuery(
      () => api.getAreasByLocation(payload),
      'getAreasByLocation',
      payload
    );
  }
  getAllAreasQuery() {
    return this.makeQuery(() => api.getAllAreas(), 'getAllAreas');
  }
}
