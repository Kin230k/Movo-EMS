import './services/firebaseAdmin'; // ensure initializeApp() has run
import { sendLoginAlert } from './callables/auth/sendLoginAlert';
import { sendPasswordReset } from './callables/auth/sendPasswordReset';
import { sendVerificationEmail } from './callables/auth/sendVerificationEmail';
import { registerUser } from './callables/auth/registerUser';
import { changeUserEmail } from './callables/auth/changeUserEmail';
import { changeUserPhone } from './callables/auth/changeUserPhone';
import { checkServiceStatus } from './callables/auth/checkServiceStatus';
import { getUserInfo } from './callables/auth/getUserInfo';
import { editUserInfo } from './callables/auth/editUserInfo';
// Export callables
export {
  sendPasswordReset,
  sendVerificationEmail,
  sendLoginAlert,
  registerUser,
  changeUserEmail,
  changeUserPhone,
  checkServiceStatus,
  getUserInfo,
  editUserInfo,
};
