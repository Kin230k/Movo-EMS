import './services/firebaseAdmin'; // ensure initializeApp() has run
import { sendLoginAlert } from './callables/auth/sendLoginAlert';
import { sendPasswordReset } from './callables/auth/sendPasswordReset';
import { registerUser } from './callables/auth/registerUser';
import { changeUserEmail } from './callables/auth/changeUserEmail';
import { checkServiceStatus } from './callables/auth/checkServiceStatus';

// Export callables
export {
  sendPasswordReset,
  sendLoginAlert,
  registerUser,
  changeUserEmail,
  checkServiceStatus,
};
