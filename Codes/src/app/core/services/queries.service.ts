// src/app/core/services/api-queries.service.ts
import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import {
  injectSendEmailMutation,
  injectCreateAdminMutation,
  injectGetAdminQuery,
  injectGetAllAdminsQuery,
  injectUpdateAdminMutation,
  injectChangeUserEmailMutation,
  injectChangeUserPhoneMutation,
  injectCheckServiceStatusQuery,
  injectEditUserInfoMutation,
  injectGetUserInfoQuery,
  injectGetUserInfoByEmailQuery,
  injectGetCallerIdentityQuery,
  injectRegisterUserMutation,
  injectSendLoginAlertMutation,
  injectSendPasswordResetMutation,
  injectSendVerificationEmailMutation,
  injectGetProjectUsersQuery,
  injectCreateClientMutation,
  injectAdminCreateClientMutation,
  injectApproveRejectClientMutation,
  injectDeleteClientMutation,
  injectGetAllClientsQuery,
  injectGetClientQuery,
  injectUpdateClientMutation,
  injectCreateProjectUserRoleMutation,
  injectUpdateProjectUserRoleMutation,
  injectDeleteProjectUserRoleMutation,
  injectGetProjectUserRoleQuery,
  injectGetAllProjectUserRolesQuery,
  injectGetProjectUserRolesByUserAndProjectQuery,
  injectCreateFormMutation,
  injectCreateQuestionsMutation,
  injectDeleteFormMutation,
  injectGetFormQuery,
  injectUpdateFormMutation,
  injectGetFormByUserQuery,
  injectCreateQuestionMutation,
  injectDeleteQuestionMutation,
  injectGetAllQuestionsQuery,
  injectGetQuestionQuery,
  injectUpdateQuestionMutation,
  injectGetInterviewQuestionsQuery,
  injectCreateSubmissionMutation,
  injectCreateSubmissionWithAnswerMutation,
  injectCreateSubmissionWithAnswersMutation,
  injectDeleteSubmissionMutation,
  injectGetSubmissionQuery,
  injectUpdateSubmissionMutation,
  injectGetManualByFormIdQuery,
  injectGetManualAnswersBySubmissionIdQuery,
  injectGetSubmissionsByFormQuery,
  injectGetAnswersBySubmissionIdQuery,
  injectUpdateSubmissionStatusMutation,
  injectGetQuestionAnswersBySubmissionQuery,
  injectCreateInterviewMutation,
  injectUpdateInterviewMutation,
  injectGetInterviewQuery,
  injectGetInterviewByProjectQuery,
  injectDeleteInterviewMutation,
  injectCreateProjectMutation,
  injectDeleteProjectMutation,
  injectGetProjectQuery,
  injectUpdateProjectMutation,
  injectGetProjectByClientQuery,
  injectGetAllProjectsQuery,
  injectGetAllActiveProjectsQuery,
  injectCreateLocationMutation,
  injectDeleteLocationMutation,
  injectGetLocationQuery,
  injectUpdateLocationMutation,
  injectCreateUserProjectMutation,
  injectDeleteUserProjectMutation,
  injectGetUserProjectQuery,
  injectUpdateUserProjectMutation,
  injectCreateScheduleMutation,
  injectDeleteScheduleMutation,
  injectGetScheduleQuery,
  injectUpdateScheduleMutation,
  injectGetSchedulesByLocationQuery,
  injectGetSchedulesByProjectOrLocationQuery,
  injectCreateUserScheduleMutation,
  injectUpdateUserScheduleMutation,
  injectCreateAttendanceMutation,
  injectDeleteAttendanceMutation,
  injectGetAttendanceQuery,
  injectUpdateAttendanceMutation,
  injectGetAttendancesByProjectQuery,
  injectGetUserAttendancesByProjectQuery,
  injectCreateAreaMutation,
  injectDeleteAreaMutation,
  injectGetAreaQuery,
  injectUpdateAreaMutation,
  injectGetAreasByLocationQuery,
  injectGetAllAreasQuery,
  injectGetAllAreasQuery as injectGetAllAreasQueryAlias,
} from '../api/api-queries';

@Injectable({ providedIn: 'root' })
export class ApiQueriesService {
  constructor(private injector: Injector) {}

  private run<T>(factory: () => T): T {
    return runInInjectionContext(this.injector, factory);
  }

  private run1<A, T>(factory: (a: A) => T, a: A): T {
    return runInInjectionContext(this.injector, () => factory(a));
  }
  // General
  sendEmailMutation() {
    return this.run(() => injectSendEmailMutation());
  }

  getUserInfoByEmailQuery(payload: any) {
    return this.run1(injectGetUserInfoByEmailQuery, payload);
  }

  getCallerIdentityQuery() {
    return this.run(() => injectGetCallerIdentityQuery());
  }

  // Admin
  createAdminMutation() {
    return this.run(() => injectCreateAdminMutation());
  }
  getAdminQuery(payload?: any) {
    return this.run1(injectGetAdminQuery, payload as any);
  }
  getAllAdminsQuery() {
    return this.run(() => injectGetAllAdminsQuery());
  }
  updateAdminMutation() {
    return this.run(() => injectUpdateAdminMutation());
  }

  // User
  changeUserEmailMutation() {
    return this.run(() => injectChangeUserEmailMutation());
  }
  changeUserPhoneMutation() {
    return this.run(() => injectChangeUserPhoneMutation());
  }
  checkServiceStatusQuery(payload: any) {
    return this.run1(injectCheckServiceStatusQuery, payload);
  }
  editUserInfoMutation() {
    return this.run(() => injectEditUserInfoMutation());
  }
  getUserInfoQuery() {
    return this.run(() => injectGetUserInfoQuery());
  }
  registerUserMutation() {
    return this.run(() => injectRegisterUserMutation());
  }
  sendLoginAlertMutation() {
    return this.run(() => injectSendLoginAlertMutation());
  }
  sendPasswordResetMutation() {
    return this.run(() => injectSendPasswordResetMutation());
  }
  sendVerificationEmailMutation() {
    return this.run(() => injectSendVerificationEmailMutation());
  }
  getProjectUsersQuery(payload: any) {
    return this.run1(injectGetProjectUsersQuery, payload);
  }

  // Clients
  createClientMutation() {
    return this.run(() => injectCreateClientMutation());
  }
  adminCreateClientMutation() {
    return this.run(() => injectAdminCreateClientMutation());
  }
  approveRejectClientMutation() {
    return this.run(() => injectApproveRejectClientMutation());
  }
  deleteClientMutation() {
    return this.run(() => injectDeleteClientMutation());
  }
  getAllClientsQuery() {
    return this.run(() => injectGetAllClientsQuery());
  }
  getClientQuery(payload: any) {
    return this.run1(injectGetClientQuery, payload);
  }
  updateClientMutation() {
    return this.run(() => injectUpdateClientMutation());
  }

  // ProjectUserRole
  createProjectUserRoleMutation() {
    return this.run(() => injectCreateProjectUserRoleMutation());
  }
  updateProjectUserRoleMutation() {
    return this.run(() => injectUpdateProjectUserRoleMutation());
  }
  deleteProjectUserRoleMutation() {
    return this.run(() => injectDeleteProjectUserRoleMutation());
  }
  getProjectUserRoleQuery(payload?: any) {
    return this.run1(injectGetProjectUserRoleQuery, payload as any);
  }
  getAllProjectUserRolesQuery() {
    return this.run(() => injectGetAllProjectUserRolesQuery());
  }
  getProjectUserRolesByUserAndProjectQuery(payload?: any) {
    return this.run1(
      injectGetProjectUserRolesByUserAndProjectQuery,
      payload as any
    );
  }

  // Forms
  createFormMutation() {
    return this.run(() => injectCreateFormMutation());
  }
  createQuestionsMutation() {
    return this.run(() => injectCreateQuestionsMutation());
  }
  deleteFormMutation() {
    return this.run(() => injectDeleteFormMutation());
  }
  getFormQuery(payload?: any) {
    return this.run1(injectGetFormQuery, payload as any);
  }
  updateFormMutation() {
    return this.run(() => injectUpdateFormMutation());
  }
  getFormByUserQuery(payload?: any) {
    return this.run1(injectGetFormByUserQuery, payload as any);
  }

  // Questions
  createQuestionMutation() {
    return this.run(() => injectCreateQuestionMutation());
  }
  deleteQuestionMutation() {
    return this.run(() => injectDeleteQuestionMutation());
  }
  getAllQuestionsQuery() {
    return this.run(() => injectGetAllQuestionsQuery());
  }
  getQuestionQuery(payload: any) {
    return this.run1(injectGetQuestionQuery, payload);
  }
  updateQuestionMutation() {
    return this.run(() => injectUpdateQuestionMutation());
  }
  getInterviewQuestionsQuery(payload: any) {
    return this.run1(injectGetInterviewQuestionsQuery, payload);
  }

  // Submissions
  createSubmissionMutation() {
    return this.run(() => injectCreateSubmissionMutation());
  }
  createSubmissionWithAnswerMutation() {
    return this.run(() => injectCreateSubmissionWithAnswerMutation());
  }
  createSubmissionWithAnswersMutation() {
    return this.run(() => injectCreateSubmissionWithAnswersMutation());
  }
  deleteSubmissionMutation() {
    return this.run(() => injectDeleteSubmissionMutation());
  }
  getSubmissionQuery(payload?: any) {
    return this.run1(injectGetSubmissionQuery, payload as any);
  }
  updateSubmissionMutation() {
    return this.run(() => injectUpdateSubmissionMutation());
  }
  getManualByFormIdQuery(payload: any) {
    return this.run1(injectGetManualByFormIdQuery, payload);
  }
  getManualAnswersBySubmissionIdQuery(payload: any) {
    return this.run1(injectGetManualAnswersBySubmissionIdQuery, payload);
  }
  getSubmissionsByFormQuery(payload: any) {
    return this.run1(injectGetSubmissionsByFormQuery, payload);
  }
  getAnswersBySubmissionIdQuery(payload: any) {
    return this.run1(injectGetAnswersBySubmissionIdQuery, payload);
  }
  updateSubmissionStatusMutation() {
    return this.run(() => injectUpdateSubmissionStatusMutation());
  }
  getQuestionAnswersBySubmissionQuery(payload: any) {
    return this.run1(injectGetQuestionAnswersBySubmissionQuery, payload);
  }

  // Interviews
  createInterviewMutation() {
    return this.run(() => injectCreateInterviewMutation());
  }
  updateInterviewMutation() {
    return this.run(() => injectUpdateInterviewMutation());
  }
  getInterviewQuery(payload: any) {
    return this.run1(injectGetInterviewQuery, payload);
  }
  getInterviewByProjectQuery(payload: any) {
    return this.run1(injectGetInterviewByProjectQuery, payload);
  }
  deleteInterviewMutation() {
    return this.run(() => injectDeleteInterviewMutation());
  }

  // Projects
  createProjectMutation() {
    return this.run(() => injectCreateProjectMutation());
  }
  deleteProjectMutation() {
    return this.run(() => injectDeleteProjectMutation());
  }
  getProjectQuery(payload: any) {
    return this.run1(injectGetProjectQuery, payload);
  }
  updateProjectMutation() {
    return this.run(() => injectUpdateProjectMutation());
  }
  getProjectByClientQuery(payload: any) {
    return this.run1(injectGetProjectByClientQuery, payload);
  }
  getAllProjectsQuery() {
    return this.run(() => injectGetAllProjectsQuery());
  }
  getAllActiveProjectsQuery() {
    return this.run(() => injectGetAllActiveProjectsQuery());
  }

  // Locations
  createLocationMutation() {
    return this.run(() => injectCreateLocationMutation());
  }
  deleteLocationMutation() {
    return this.run(() => injectDeleteLocationMutation());
  }
  getLocationQuery(payload: any) {
    return this.run1(injectGetLocationQuery, payload);
  }
  updateLocationMutation() {
    return this.run(() => injectUpdateLocationMutation());
  }

  // UserProject
  createUserProjectMutation() {
    return this.run(() => injectCreateUserProjectMutation());
  }
  deleteUserProjectMutation() {
    return this.run(() => injectDeleteUserProjectMutation());
  }
  getUserProjectQuery(payload: any) {
    return this.run1(injectGetUserProjectQuery, payload);
  }
  updateUserProjectMutation() {
    return this.run(() => injectUpdateUserProjectMutation());
  }

  // Schedule
  createScheduleMutation() {
    return this.run(() => injectCreateScheduleMutation());
  }
  deleteScheduleMutation() {
    return this.run(() => injectDeleteScheduleMutation());
  }
  getScheduleQuery(payload: any) {
    return this.run1(injectGetScheduleQuery, payload);
  }
  updateScheduleMutation() {
    return this.run(() => injectUpdateScheduleMutation());
  }
  getSchedulesByProjectOrLocationQuery(payload: any) {
    return this.run1(injectGetSchedulesByProjectOrLocationQuery, payload);
  }

  // UserSchedule
  createUserScheduleMutation() {
    return this.run(() => injectCreateUserScheduleMutation());
  }
  updateUserScheduleMutation() {
    return this.run(() => injectUpdateUserScheduleMutation());
  }

  // Attendance
  createAttendanceMutation() {
    return this.run(() => injectCreateAttendanceMutation());
  }
  deleteAttendanceMutation() {
    return this.run(() => injectDeleteAttendanceMutation());
  }
  getAttendanceQuery(payload: any) {
    return this.run1(injectGetAttendanceQuery, payload);
  }
  updateAttendanceMutation() {
    return this.run(() => injectUpdateAttendanceMutation());
  }
  getAttendancesByProjectQuery(payload: any) {
    return this.run1(injectGetAttendancesByProjectQuery, payload);
  }
  getUserAttendancesByProjectQuery(payload: any) {
    return this.run1(injectGetUserAttendancesByProjectQuery, payload);
  }

  // Areas
  createAreaMutation() {
    return this.run(() => injectCreateAreaMutation());
  }
  deleteAreaMutation() {
    return this.run(() => injectDeleteAreaMutation());
  }
  getAreaQuery(payload: any) {
    return this.run1(injectGetAreaQuery, payload);
  }
  updateAreaMutation() {
    return this.run(() => injectUpdateAreaMutation());
  }
  getAreasByLocationQuery(payload: any) {
    return this.run1(injectGetAreasByLocationQuery, payload);
  }
  getAllAreasQuery() {
    return this.run(() => injectGetAllAreasQuery());
  }
}
