import './services/firebaseAdmin'; // ensure initializeApp() has run
import { sendLoginAlert } from './callables/auth/sendLoginAlert';
import { sendPasswordReset } from './callables/auth/sendPasswordReset';
import { registerUser } from './callables/auth/registerUser';
import { changeUserEmail } from './callables/auth/changeUserEmail';
import { checkServiceStatus } from './callables/auth/checkServiceStatus';
import { login } from './callables/auth/login';
import { logout } from './callables/auth/logout';
// Export callables
export {
  sendPasswordReset,
  sendLoginAlert,
  registerUser,
  changeUserEmail,
  checkServiceStatus,
  login,
  logout,
};
