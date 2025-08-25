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
} from './callables/auth/auth.callable';

// Import forms callables
import {
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

} from './callables/forms/forms.callable';

// Import project-related callables
import {
  createProject,
  deleteProject,
  getProject,
  updateProject,
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
} from './callables/auth/projectUserRole.callable';

import { getFunctions } from './callables/getFunctions';

import './services/firebaseAdmin'; // ensure initializeApp() has run

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

  // Forms - core
  createForm,
  createFormWithQuestions,
  deleteForm,
  getForm,
  updateForm,

  // Forms - questions
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,

  // Forms - submissions
  createSubmission,
  deleteSubmission,
  getSubmission,
  updateSubmission,

  // Projects
  createProject,
  deleteProject,
  getProject,
  updateProject,

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
  
   
  // Project User Roles
  createProjectUserRole,
  updateProjectUserRole,
  deleteProjectUserRole,
  getProjectUserRole,
  getAllProjectUserRoles,
  getProjectUserRolesByUserAndProject,

  // Interview
  createInterview,
  updateInterview,
  deleteInterview,
  getInterview,
  getInterviewByProject,

  // Test
  getFunctions,
};