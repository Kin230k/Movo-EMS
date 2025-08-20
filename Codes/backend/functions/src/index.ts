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
} from './callables/forms/forms.callable';
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

  //test
  getFunctions,
};
