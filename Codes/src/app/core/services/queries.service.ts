// src/app/core/services/api-queries.service.ts
import { Injectable } from '@angular/core';
import {
  injectCreateAdminMutation,
  injectGetAdminQuery,
  injectGetAllAdminsQuery,
  injectUpdateAdminMutation,
  injectChangeUserEmailMutation,
  injectChangeUserPhoneMutation,
  injectCheckServiceStatusQuery,
  injectEditUserInfoMutation,
  injectGetUserInfoQuery,
  injectRegisterUserMutation,
  injectSendLoginAlertMutation,
  injectSendPasswordResetMutation,
  injectSendVerificationEmailMutation,
  injectGetProjectUsersQuery,
  injectCreateClientMutation,
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
  injectCreateFormWithQuestionsMutation,
  injectDeleteFormMutation,
  injectGetFormQuery,
  injectUpdateFormMutation,
  injectCreateQuestionMutation,
  injectDeleteQuestionMutation,
  injectGetAllQuestionsQuery,
  injectGetQuestionQuery,
  injectUpdateQuestionMutation,
  injectCreateSubmissionMutation,
  injectDeleteSubmissionMutation,
  injectGetSubmissionQuery,
  injectUpdateSubmissionMutation,
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
} from '../api/api-queries';

@Injectable({ providedIn: 'root' })
export class ApiQueriesService {
  // Admin
  createAdminMutation() {
    return injectCreateAdminMutation();
  }
  getAdminQuery(payload?: any) {
    return injectGetAdminQuery(payload);
  }
  getAllAdminsQuery() {
    return injectGetAllAdminsQuery();
  }
  updateAdminMutation() {
    return injectUpdateAdminMutation();
  }

  // User
  changeUserEmailMutation() {
    return injectChangeUserEmailMutation();
  }
  changeUserPhoneMutation() {
    return injectChangeUserPhoneMutation();
  }
  checkServiceStatusQuery(payload: any) {
    return injectCheckServiceStatusQuery(payload);
  }
  editUserInfoMutation() {
    return injectEditUserInfoMutation();
  }
  getUserInfoQuery() {
    return injectGetUserInfoQuery();
  }
  registerUserMutation() {
    return injectRegisterUserMutation();
  }
  sendLoginAlertMutation() {
    return injectSendLoginAlertMutation();
  }
  sendPasswordResetMutation() {
    return injectSendPasswordResetMutation();
  }
  sendVerificationEmailMutation() {
    return injectSendVerificationEmailMutation();
  }
  getProjectUsersQuery(payload: any) {
    return injectGetProjectUsersQuery(payload);
  }

  // Clients
  createClientMutation() {
    return injectCreateClientMutation();
  }
  approveRejectClientMutation() {
    return injectApproveRejectClientMutation();
  }
  deleteClientMutation() {
    return injectDeleteClientMutation();
  }
  getAllClientsQuery() {
    return injectGetAllClientsQuery();
  }
  getClientQuery(payload: any) {
    return injectGetClientQuery(payload);
  }
  updateClientMutation() {
    return injectUpdateClientMutation();
  }

  // ProjectUserRole
  createProjectUserRoleMutation() {
    return injectCreateProjectUserRoleMutation();
  }
  updateProjectUserRoleMutation() {
    return injectUpdateProjectUserRoleMutation();
  }
  deleteProjectUserRoleMutation() {
    return injectDeleteProjectUserRoleMutation();
  }
  getProjectUserRoleQuery(payload?: any) {
    return injectGetProjectUserRoleQuery(payload);
  }
  getAllProjectUserRolesQuery() {
    return injectGetAllProjectUserRolesQuery();
  }
  getProjectUserRolesByUserAndProjectQuery(payload?: any) {
    return injectGetProjectUserRolesByUserAndProjectQuery(payload);
  }

  // Forms
  createFormMutation() {
    return injectCreateFormMutation();
  }
  createFormWithQuestionsMutation() {
    return injectCreateFormWithQuestionsMutation();
  }
  deleteFormMutation() {
    return injectDeleteFormMutation();
  }
  getFormQuery(payload?: any) {
    return injectGetFormQuery(payload);
  }
  updateFormMutation() {
    return injectUpdateFormMutation();
  }

  // Questions
  createQuestionMutation() {
    return injectCreateQuestionMutation();
  }
  deleteQuestionMutation() {
    return injectDeleteQuestionMutation();
  }
  getAllQuestionsQuery() {
    return injectGetAllQuestionsQuery();
  }
  getQuestionQuery(payload: any) {
    return injectGetQuestionQuery(payload);
  }
  updateQuestionMutation() {
    return injectUpdateQuestionMutation();
  }

  // Submissions
  createSubmissionMutation() {
    return injectCreateSubmissionMutation();
  }
  deleteSubmissionMutation() {
    return injectDeleteSubmissionMutation();
  }
  getSubmissionQuery(payload?: any) {
    return injectGetSubmissionQuery(payload);
  }
  updateSubmissionMutation() {
    return injectUpdateSubmissionMutation();
  }

  // Interviews
  createInterviewMutation() {
    return injectCreateInterviewMutation();
  }
  updateInterviewMutation() {
    return injectUpdateInterviewMutation();
  }
  getInterviewQuery(payload: any) {
    return injectGetInterviewQuery(payload);
  }
  getInterviewByProjectQuery(payload: any) {
    return injectGetInterviewByProjectQuery(payload);
  }
  deleteInterviewMutation() {
    return injectDeleteInterviewMutation();
  }

  // Projects
  createProjectMutation() {
    return injectCreateProjectMutation();
  }
  deleteProjectMutation() {
    return injectDeleteProjectMutation();
  }
  getProjectQuery(payload: any) {
    return injectGetProjectQuery(payload);
  }
  updateProjectMutation() {
    return injectUpdateProjectMutation();
  }
  getProjectByClientQuery(payload: any) {
    return injectGetProjectByClientQuery(payload);
  }

  // Locations
  createLocationMutation() {
    return injectCreateLocationMutation();
  }
  deleteLocationMutation() {
    return injectDeleteLocationMutation();
  }
  getLocationQuery(payload: any) {
    return injectGetLocationQuery(payload);
  }
  updateLocationMutation() {
    return injectUpdateLocationMutation();
  }

  // UserProject
  createUserProjectMutation() {
    return injectCreateUserProjectMutation();
  }
  deleteUserProjectMutation() {
    return injectDeleteUserProjectMutation();
  }
  getUserProjectQuery(payload: any) {
    return injectGetUserProjectQuery(payload);
  }
  updateUserProjectMutation() {
    return injectUpdateUserProjectMutation();
  }

  // Schedule
  createScheduleMutation() {
    return injectCreateScheduleMutation();
  }
  deleteScheduleMutation() {
    return injectDeleteScheduleMutation();
  }
  getScheduleQuery(payload: any) {
    return injectGetScheduleQuery(payload);
  }
  updateScheduleMutation() {
    return injectUpdateScheduleMutation();
  }

  // UserSchedule
  createUserScheduleMutation() {
    return injectCreateUserScheduleMutation();
  }
  updateUserScheduleMutation() {
    return injectUpdateUserScheduleMutation();
  }

  // Attendance
  createAttendanceMutation() {
    return injectCreateAttendanceMutation();
  }
  deleteAttendanceMutation() {
    return injectDeleteAttendanceMutation();
  }
  getAttendanceQuery(payload: any) {
    return injectGetAttendanceQuery(payload);
  }
  updateAttendanceMutation() {
    return injectUpdateAttendanceMutation();
  }
  getAttendancesByProjectQuery(payload: any) {
    return injectGetAttendancesByProjectQuery(payload);
  }
  getUserAttendancesByProjectQuery(payload: any) {
    return injectGetUserAttendancesByProjectQuery(payload);
  }

  // Areas
  createAreaMutation() {
    return injectCreateAreaMutation();
  }
  deleteAreaMutation() {
    return injectDeleteAreaMutation();
  }
  getAreaQuery(payload: any) {
    return injectGetAreaQuery(payload);
  }
  updateAreaMutation() {
    return injectUpdateAreaMutation();
  }
  getAreasByLocationQuery(payload: any) {
    return injectGetAreasByLocationQuery(payload);
  }
  getAllAreasQuery() {
    return injectGetAllAreasQuery();
  }
}
