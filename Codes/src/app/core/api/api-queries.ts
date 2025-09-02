// app/core/api/api-queries.ts
// Auto-generated query and mutation wrappers for API endpoints using @tanstack/angular-query-experimental v5.

import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import { inject } from '@angular/core';
import { QueryClient } from '@tanstack/query-core';
import api from './api';
import type {
  SendEmailPayload,
  CreateAdminPayload,
  GetAdminPayload,
  UpdateAdminPayload,
  GetUserInfoByEmailPayload,
  GetCallerIdentityPayload,
  ChangeUserEmailPayload,
  ChangeUserPhonePayload,
  CheckServiceStatusPayload,
  EditUserInfoPayload,
  RegisterUserPayload,
  SendLoginAlertPayload,
  SendPasswordResetPayload,
  SendVerificationEmailPayload,
  GetProjectUsersPayload,
  CreateClientPayload,
  AdminCreateClientPayload,
  ApproveRejectClientPayload,
  DeleteClientPayload,
  GetClientPayload,
  UpdateClientPayload,
  CreateProjectUserRolePayload,
  UpdateProjectUserRolePayload,
  DeleteProjectUserRolePayload,
  GetProjectUserRolePayload,
  GetProjectUserRolesByUserAndProjectPayload,
  CreateFormPayload,
  CreateQuestionsPayload,
  DeleteFormPayload,
  GetFormPayload,
  UpdateFormPayload,
  GetFormByUserPayload,
  CreateQuestionPayload,
  DeleteQuestionPayload,
  GetQuestionPayload,
  UpdateQuestionPayload,
  GetInterviewQuestionsPayload,
  CreateSubmissionPayload,
  CreateSubmissionWithAnswerPayload,
  CreateSubmissionWithAnswersPayload,
  DeleteSubmissionPayload,
  GetSubmissionPayload,
  UpdateSubmissionPayload,
  GetManualByFormIdPayload,
  GetManualAnswersBySubmissionIdPayload,
  GetSubmissionsByFormPayload,
  GetAnswersBySubmissionIdPayload,
  UpdateSubmissionStatusPayload,
  GetQuestionAnswersBySubmissionPayload,
  CreateInterviewPayload,
  UpdateInterviewPayload,
  GetInterviewPayload,
  GetInterviewByProjectPayload,
  DeleteInterviewPayload,
  CreateProjectPayload,
  DeleteProjectPayload,
  GetProjectPayload,
  UpdateProjectPayload,
  GetProjectByClientPayload,
  GetSchedulesByLocationPayload,
  GetSchedulesByProjectOrLocationPayload,
  CreateLocationPayload,
  DeleteLocationPayload,
  GetLocationPayload,
  UpdateLocationPayload,
  CreateUserProjectPayload,
  DeleteUserProjectPayload,
  GetUserProjectPayload,
  UpdateUserProjectPayload,
  CreateSchedulePayload,
  DeleteSchedulePayload,
  GetSchedulePayload,
  UpdateSchedulePayload,
  CreateUserSchedulePayload,
  UpdateUserSchedulePayload,
  CreateAttendancePayload,
  DeleteAttendancePayload,
  GetAttendancePayload,
  UpdateAttendancePayload,
  GetAttendancesByProjectPayload,
  GetUserAttendancesByProjectPayload,
  CreateAreaPayload,
  DeleteAreaPayload,
  GetAreaPayload,
  UpdateAreaPayload,
  GetAreasByLocationPayload,
} from './api';

// Helper to generate unique query keys based on payloads
function queryKeyFor(payload: any, base: string | string[]): any[] {
  const key = Array.isArray(base) ? [...base] : [base];
  if (payload && Object.keys(payload).length > 0) {
    key.push(payload);
  }
  return key;
}

// Admin queries and mutations
export function injectSendEmailMutation() {
  return injectMutation(() => ({
    mutationFn: (payload: SendEmailPayload) => api.sendEmail(payload),
  }));
}

export function injectCreateAdminMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateAdminPayload) => api.createAdmin(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admins'] }),
  }));
}

export function injectGetAdminQuery(payload?: GetAdminPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload ?? {}, [
      'admin',
      payload?.adminId ?? 'current',
    ]),
    queryFn: () => api.getAdmin(payload),
  }));
}

export function injectGetAllAdminsQuery() {
  return injectQuery(() => ({
    queryKey: ['admins'],
    queryFn: () => api.getAllAdmins(),
  }));
}

export function injectUpdateAdminMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateAdminPayload) => api.updateAdmin(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({ queryKey: ['admin', payload.adminId] }),
  }));
}

// User queries and mutations
export function injectGetUserInfoByEmailQuery(
  payload: GetUserInfoByEmailPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['userInfoByEmail', payload.email]),
    queryFn: () => api.getUserInfoByEmail(payload),
  }));
}

export function injectGetCallerIdentityQuery(
  payload?: GetCallerIdentityPayload
) {
  return injectQuery(() => ({
    queryKey: ['callerIdentity'],
    queryFn: () => api.getCallerIdentity(payload),
  }));
}

export function injectChangeUserEmailMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: ChangeUserEmailPayload) =>
      api.changeUserEmail(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userInfo'] }),
  }));
}

export function injectChangeUserPhoneMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: ChangeUserPhonePayload) =>
      api.changeUserPhone(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userInfo'] }),
  }));
}

export function injectCheckServiceStatusQuery(
  payload: CheckServiceStatusPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, 'checkServiceStatus'),
    queryFn: () => api.checkServiceStatus(payload),
  }));
}

export function injectEditUserInfoMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: EditUserInfoPayload) => api.editUserInfo(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userInfo'] }),
  }));
}

export function injectGetUserInfoQuery() {
  return injectQuery(() => ({
    queryKey: ['userInfo'],
    queryFn: () => api.getUserInfo(),
  }));
}

export function injectRegisterUserMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: RegisterUserPayload) => api.registerUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userInfo'] }),
  }));
}

export function injectSendLoginAlertMutation() {
  return injectMutation(() => ({
    mutationFn: (payload?: SendLoginAlertPayload) =>
      api.sendLoginAlert(payload),
  }));
}

export function injectSendPasswordResetMutation() {
  return injectMutation(() => ({
    mutationFn: (payload: SendPasswordResetPayload) =>
      api.sendPasswordReset(payload),
  }));
}

export function injectSendVerificationEmailMutation() {
  return injectMutation(() => ({
    mutationFn: (payload: SendVerificationEmailPayload) =>
      api.sendVerificationEmail(payload),
  }));
}

export function injectGetProjectUsersQuery(payload: GetProjectUsersPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['projectUsers', payload.projectId]),
    queryFn: () => api.getProjectUsers(payload),
  }));
}

// Client queries and mutations
export function injectCreateClientMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateClientPayload) => api.createClient(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  }));
}

export function injectAdminCreateClientMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: AdminCreateClientPayload) =>
      api.adminCreateClient(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  }));
}

export function injectApproveRejectClientMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: ApproveRejectClientPayload) =>
      api.approveRejectClient(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({ queryKey: ['client', payload.clientId] }),
  }));
}

export function injectDeleteClientMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteClientPayload) => api.deleteClient(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  }));
}

export function injectGetAllClientsQuery() {
  return injectQuery(() => ({
    queryKey: ['clients'],
    queryFn: () => api.getAllClients(),
  }));
}

export function injectGetClientQuery(payload: GetClientPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['client', payload.clientId]),
    queryFn: () => api.getClient(payload),
  }));
}

export function injectUpdateClientMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateClientPayload) => api.updateClient(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({ queryKey: ['client', payload.clientId] }),
  }));
}

// ProjectUserRole queries and mutations
export function injectCreateProjectUserRoleMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateProjectUserRolePayload = {}) =>
      api.createProjectUserRole(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projectUserRoles'] }),
  }));
}

export function injectUpdateProjectUserRoleMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateProjectUserRolePayload = {}) =>
      api.updateProjectUserRole(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projectUserRoles'] }),
  }));
}

export function injectDeleteProjectUserRoleMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteProjectUserRolePayload = {}) =>
      api.deleteProjectUserRole(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projectUserRoles'] }),
  }));
}

export function injectGetProjectUserRoleQuery(
  payload: GetProjectUserRolePayload = {}
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, [
      'projectUserRole',
      payload.projectUserRoleId!,
    ]),
    queryFn: () => api.getProjectUserRole(payload),
  }));
}

export function injectGetAllProjectUserRolesQuery() {
  return injectQuery(() => ({
    queryKey: ['projectUserRoles'],
    queryFn: () => api.getAllProjectUserRoles(),
  }));
}

export function injectGetProjectUserRolesByUserAndProjectQuery(
  payload: GetProjectUserRolesByUserAndProjectPayload = {}
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, [
      'projectUserRolesByUserAndProject',
      payload.userId!,
      payload.projectId!,
    ]),
    queryFn: () => api.getProjectUserRolesByUserAndProject(payload),
  }));
}

// Form queries and mutations
export function injectCreateFormMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateFormPayload = {}) => api.createForm(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forms'] }),
  }));
}

export function injectCreateQuestionsMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateQuestionsPayload) =>
      api.createQuestions(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forms'] }),
  }));
}

export function injectDeleteFormMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteFormPayload = {}) => api.deleteForm(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forms'] }),
  }));
}

export function injectGetFormQuery(payload: GetFormPayload = {}) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['form', payload.formId!]),
    queryFn: () => api.getForm(payload),
  }));
}

export function injectUpdateFormMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateFormPayload = {}) => api.updateForm(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({ queryKey: ['form', payload!.formId] }),
  }));
}

export function injectGetFormByUserQuery(payload: GetFormByUserPayload = {}) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['formByUser', payload.userId!]),
    queryFn: () => api.getFormByUser(payload),
  }));
}

// Question queries and mutations
export function injectCreateQuestionMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateQuestionPayload) => api.createQuestion(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  }));
}

export function injectDeleteQuestionMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteQuestionPayload) => api.deleteQuestion(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions'] }),
  }));
}

export function injectGetAllQuestionsQuery() {
  return injectQuery(() => ({
    queryKey: ['questions'],
    queryFn: () => api.getAllQuestions(),
  }));
}

export function injectGetQuestionQuery(payload: GetQuestionPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['question', payload.questionId]),
    queryFn: () => api.getQuestion(payload),
  }));
}

export function injectUpdateQuestionMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateQuestionPayload) => api.updateQuestion(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: ['question', payload.questionId],
      }),
  }));
}

export function injectGetInterviewQuestionsQuery(
  payload: GetInterviewQuestionsPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['interviewQuestions', payload.interviewId]),
    queryFn: () => api.getInterviewQuestions(payload),
  }));
}

// Submission queries and mutations
export function injectCreateSubmissionMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateSubmissionPayload = {}) =>
      api.createSubmission(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  }));
}

export function injectCreateSubmissionWithAnswerMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateSubmissionWithAnswerPayload) =>
      api.createSubmissionWithAnswer(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  }));
}

export function injectCreateSubmissionWithAnswersMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateSubmissionWithAnswersPayload) =>
      api.createSubmissionWithAnswers(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  }));
}

export function injectDeleteSubmissionMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteSubmissionPayload = {}) =>
      api.deleteSubmission(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  }));
}

export function injectGetSubmissionQuery(payload: GetSubmissionPayload = {}) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['submission', payload.submissionId!]),
    queryFn: () => api.getSubmission(payload),
  }));
}

export function injectUpdateSubmissionMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateSubmissionPayload) =>
      api.updateSubmission(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: ['submission', payload.submissionId],
      }),
  }));
}

export function injectGetManualByFormIdQuery(
  payload: GetManualByFormIdPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['manualByForm', payload.formId]),
    queryFn: () => api.getManualByFormId(payload),
  }));
}

export function injectGetManualAnswersBySubmissionIdQuery(
  payload: GetManualAnswersBySubmissionIdPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, [
      'manualAnswersBySubmission',
      payload.submissionId,
    ]),
    queryFn: () => api.getManualAnswersBySubmissionId(payload),
  }));
}

export function injectGetSubmissionsByFormQuery(
  payload: GetSubmissionsByFormPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['submissionsByForm', payload.formId]),
    queryFn: () => api.getSubmissionsByForm(payload),
  }));
}

export function injectGetAnswersBySubmissionIdQuery(
  payload: GetAnswersBySubmissionIdPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, [
      'answersBySubmissionId',
      payload.submissionId,
    ]),
    queryFn: () => api.getAnswersBySubmissionId(payload),
  }));
}

export function injectUpdateSubmissionStatusMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateSubmissionStatusPayload) =>
      api.updateSubmissionStatus(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  }));
}

export function injectGetQuestionAnswersBySubmissionQuery(
  payload: GetQuestionAnswersBySubmissionPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, [
      'questionAnswersBySubmission',
      payload.submissionId,
    ]),
    queryFn: () => api.getQuestionAnswersBySubmission(payload),
  }));
}

// Interview queries and mutations
export function injectCreateInterviewMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateInterviewPayload) =>
      api.createInterview(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['interviews'] }),
  }));
}

export function injectUpdateInterviewMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateInterviewPayload) =>
      api.updateInterview(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: ['interview', payload.interviewId],
      }),
  }));
}

export function injectGetInterviewQuery(payload: GetInterviewPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['interview', payload.interviewId]),
    queryFn: () => api.getInterview(payload),
  }));
}

export function injectGetInterviewByProjectQuery(
  payload: GetInterviewByProjectPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['interviewByProject', payload.projectId]),
    queryFn: () => api.getInterviewByProject(payload),
  }));
}

export function injectDeleteInterviewMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteInterviewPayload) =>
      api.deleteInterview(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['interviews'] }),
  }));
}

// Project queries and mutations
export function injectCreateProjectMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateProjectPayload) => api.createProject(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  }));
}

export function injectDeleteProjectMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteProjectPayload) => api.deleteProject(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  }));
}

export function injectGetProjectQuery(payload: GetProjectPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['project', payload.projectId]),
    queryFn: () => api.getProject(payload),
  }));
}

export function injectUpdateProjectMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateProjectPayload) => api.updateProject(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: ['project', payload.projectId],
      }),
  }));
}

export function injectGetProjectByClientQuery(
  payload: GetProjectByClientPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['projectsByClient', payload.clientId]),
    queryFn: () => api.getProjectByClient(payload),
  }));
}

export function injectGetAllProjectsQuery() {
  return injectQuery(() => ({
    queryKey: ['projects'],
    queryFn: () => api.getAllProjects(),
  }));
}

export function injectGetAllActiveProjectsQuery() {
  return injectQuery(() => ({
    queryKey: ['projectsActive'],
    queryFn: () => api.getAllActiveProjects(),
  }));
}

// Location queries and mutations
export function injectCreateLocationMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateLocationPayload) => api.createLocation(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  }));
}

export function injectDeleteLocationMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteLocationPayload) => api.deleteLocation(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  }));
}

export function injectGetLocationQuery(payload: GetLocationPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['location', payload.locationId]),
    queryFn: () => api.getLocation(payload),
  }));
}

export function injectUpdateLocationMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateLocationPayload) => api.updateLocation(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: ['location', payload.locationId],
      }),
  }));
}

// UserProject queries and mutations
export function injectCreateUserProjectMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateUserProjectPayload) =>
      api.createUserProject(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['userProjects'] }),
  }));
}

export function injectDeleteUserProjectMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteUserProjectPayload) =>
      api.deleteUserProject(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['userProjects'] }),
  }));
}

export function injectGetUserProjectQuery(payload: GetUserProjectPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['userProject', payload.userProjectId]),
    queryFn: () => api.getUserProject(payload),
  }));
}

export function injectUpdateUserProjectMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateUserProjectPayload) =>
      api.updateUserProject(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: ['userProject', payload.userProjectId],
      }),
  }));
}

// Schedule queries and mutations
export function injectCreateScheduleMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateSchedulePayload) => api.createSchedule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  }));
}

export function injectDeleteScheduleMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteSchedulePayload) => api.deleteSchedule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  }));
}

export function injectGetScheduleQuery(payload: GetSchedulePayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['schedule', payload.scheduleId]),
    queryFn: () => api.getSchedule(payload),
  }));
}

export function injectUpdateScheduleMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateSchedulePayload) => api.updateSchedule(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: ['schedule', payload.scheduleId],
      }),
  }));
}

export function injectGetSchedulesByLocationQuery(
  payload: GetSchedulesByLocationPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['schedulesByLocation', payload.locationId]),
    queryFn: () => api.getSchedulesByLocation(payload),
  }));
}

export function injectGetSchedulesByProjectOrLocationQuery(
  payload: GetSchedulesByProjectOrLocationPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, [
      'schedulesByProjectOrLocation',
      payload.projectId ?? 'none',
      payload.locationId ?? 'none',
    ]),
    queryFn: () => api.getSchedulesByProjectOrLocation(payload),
  }));
}

// UserSchedule mutations
export function injectCreateUserScheduleMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateUserSchedulePayload) =>
      api.createUserSchedule(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['userSchedules'] }),
  }));
}

export function injectUpdateUserScheduleMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateUserSchedulePayload) =>
      api.updateUserSchedule(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['userSchedules'] }),
  }));
}

// Attendance queries and mutations
export function injectCreateAttendanceMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateAttendancePayload) =>
      api.createAttendance(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['attendances'] }),
  }));
}

export function injectDeleteAttendanceMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteAttendancePayload) =>
      api.deleteAttendance(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['attendances'] }),
  }));
}

export function injectGetAttendanceQuery(payload: GetAttendancePayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['attendance', payload.attendanceId]),
    queryFn: () => api.getAttendance(payload),
  }));
}

export function injectUpdateAttendanceMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateAttendancePayload) =>
      api.updateAttendance(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: ['attendance', payload.attendanceId],
      }),
  }));
}

export function injectGetAttendancesByProjectQuery(
  payload: GetAttendancesByProjectPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['attendancesByProject', payload.projectId]),
    queryFn: () => api.getAttendancesByProject(payload),
  }));
}

export function injectGetUserAttendancesByProjectQuery(
  payload: GetUserAttendancesByProjectPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, [
      'userAttendancesByProject',
      payload.projectId,
    ]),
    queryFn: () => api.getUserAttendancesByProject(payload),
  }));
}

// Area queries and mutations
export function injectCreateAreaMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: CreateAreaPayload) => api.createArea(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['areas'] }),
  }));
}

export function injectDeleteAreaMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: DeleteAreaPayload) => api.deleteArea(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['areas'] }),
  }));
}

export function injectGetAreaQuery(payload: GetAreaPayload) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['area', payload.areaId]),
    queryFn: () => api.getArea(payload),
  }));
}

export function injectUpdateAreaMutation() {
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (payload: UpdateAreaPayload) => api.updateArea(payload),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({ queryKey: ['area', payload.areaId] }),
  }));
}

export function injectGetAreasByLocationQuery(
  payload: GetAreasByLocationPayload
) {
  return injectQuery(() => ({
    queryKey: queryKeyFor(payload, ['areasByLocation', payload.locationId]),
    queryFn: () => api.getAreasByLocation(payload),
  }));
}

export function injectGetAllAreasQuery() {
  return injectQuery(() => ({
    queryKey: ['areas'],
    queryFn: () => api.getAllAreas(),
  }));
}
