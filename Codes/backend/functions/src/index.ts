// Import auth callables
import {
  createAdmin,
  getAdmin,
  getAllAdmins,
  updateAdmin,
} from './callables/auth/admin.callable';
import {
  createClient,
  approveRejectClient,
  deleteClient,
  getAllClients,
  getClient,
  updateClient,
  adminCreateClient,
} from './callables/auth/client.callable';
import {
  sendPasswordReset,
  sendVerificationEmail,
  sendLoginAlert,
  registerUser,
  changeUserEmail,
  changeUserPhone,
  checkServiceStatus,
  getUserInfo,
  editUserInfo,
  getProjectUsers,
  getUserInfoByEmail,
  getCallerIdentity,
  getUserByForm,
} from './callables/auth/auth.callable';

// Import forms callables
import {
  createForm,
  createQuestions,
  deleteForm,
  getForm,
  updateForm,
  getFormByUser,
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  getInterviewQuestions,
  getAllFormQuestions,
  getFormQuestionsByProjectOrLocation,
  createSubmission,
  deleteSubmission,
  getSubmission,
  getManualByFormId,
  createSubmissionWithAnswer,
  createSubmissionWithAnswers,
  getAnswersBySubmissionId,
  getManualAnswersBySubmissionId,
  getSubmissionsByForm,
  updateSubmissionStatus,
  updateSubmission,
  getQuestionAnswersBySubmission,
  createInterview,
  updateInterview,
  getInterview,
  getInterviewByProject,
  deleteInterview,
} from './callables/forms/forms.callable';

// Import project-related callables
import {
  createProject,
  deleteProject,
  getProject,
  getProjectsByClient,
  getAllProjects,
  getAllActiveProjects,
  updateProject,
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
} from './callables/projects/projects.callable';
// Import ProjectUserRole callables
import {
  createProjectUserRole,
  updateProjectUserRole,
  deleteProjectUserRole,
  getProjectUserRole,
  getAllProjectUserRoles,
  getProjectUserRolesByUserAndProject,
  deleteProjectUserRolesByUserAndProject,
} from './callables/auth/projectUserRole.callable';

import { getFunctions } from './callables/getFunctions';

import './services/firebaseAdmin'; // ensure initializeApp() has run
import { sendEmail } from './callables/sendEmail.callable';

// Export all callables
export {
  // Auth user
  sendPasswordReset,
  sendVerificationEmail,
  sendLoginAlert,
  registerUser,
  changeUserEmail,
  changeUserPhone,
  checkServiceStatus,
  getUserInfo,
  editUserInfo,
  getProjectUsers,
  getUserInfoByEmail,
  getCallerIdentity,
  getUserByForm,
  // Auth admin
  createAdmin,
  getAdmin,
  getAllAdmins,
  updateAdmin,

  // Auth client
  createClient,
  approveRejectClient,
  deleteClient,
  getAllClients,
  getClient,
  updateClient,
  adminCreateClient,

  // Forms - core
  createForm,
  createQuestions,
  deleteForm,
  getForm,
  updateForm,
  getFormByUser,

  // Forms - questions
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  getInterviewQuestions,
  getAllFormQuestions,
  getFormQuestionsByProjectOrLocation,

  // Forms - submissions
  createSubmission,
  deleteSubmission,
  getSubmission,
  updateSubmission,
  getManualByFormId,
  createSubmissionWithAnswer,
  createSubmissionWithAnswers,
  getAnswersBySubmissionId,
  getSubmissionsByForm,
  getManualAnswersBySubmissionId,
  updateSubmissionStatus,
  getQuestionAnswersBySubmission,

  // Projects
  createProject,
  deleteProject,
  getProject,
  updateProject,
  getProjectsByClient,
  getAllProjects,
  getAllActiveProjects,
  getProjectInfoById,

  // Locations
  createLocation,
  deleteLocation,
  getLocation,
  updateLocation,

  // User Projects
  createUserProject,
  deleteUserProject,
  getUserProject,
  updateUserProject,

  // Schedules
  createSchedule,
  deleteSchedule,
  getSchedule,
  updateSchedule,
  getSchedulesByLocation,
  getSchedulesByProjectOrLocation,

  // User Schedules
  createUserSchedule,
  updateUserSchedule,

  // Areas
  createArea,
  deleteArea,
  getArea,
  updateArea,
  getAreasByLocation,
  getAllAreas,

  // Attendance
  createAttendance,
  deleteAttendance,
  getAttendance,
  updateAttendance,
  getAttendancesByProject,
  getUserAttendancesByProject,

  // Project User Roles
  createProjectUserRole,
  updateProjectUserRole,
  deleteProjectUserRole,
  getProjectUserRole,
  getAllProjectUserRoles,
  getProjectUserRolesByUserAndProject,
  deleteProjectUserRolesByUserAndProject,

  // Interview
  createInterview,
  updateInterview,
  deleteInterview,
  getInterview,
  getInterviewByProject,

  // Email
  sendEmail,

  // Test
  getFunctions,
};
