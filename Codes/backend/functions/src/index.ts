// Import auth callables
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
} from './callables/auth/authCallable';

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
} from './callables/form/formsCallable';

import './services/firebaseAdmin'; // ensure initializeApp() has run

// Export all callables
export {
  // Auth
  sendPasswordReset,
  sendVerificationEmail,
  sendLoginAlert,
  registerUser,
  changeUserEmail,
  changeUserPhone,
  checkServiceStatus,
  getUserInfo,
  editUserInfo,

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
};
