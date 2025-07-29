import './utils/firebaseAdmin'; // ensure initializeApp() has run
import { sendLoginAlert } from './callables/sendLoginAlert';
import { sendPasswordReset } from './callables/sendPasswordReset';
import { registerUser } from './callables/registerUser';
import { changeUserEmail } from './callables/changeUserEmail';
import { checkServiceStatus } from './callables/checkServiceStatus';

// Export callables
export {
  sendPasswordReset,
  sendLoginAlert,
  registerUser,
  changeUserEmail,
  checkServiceStatus,
};
