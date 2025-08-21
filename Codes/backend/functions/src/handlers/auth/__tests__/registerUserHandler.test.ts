import { CallableRequest } from 'firebase-functions/v2/https';
import { registerUserHandler, RegisterUserData } from '../registerUserHandler';

import { UserService } from '../../../models/auth/user/user.service';
import * as validators from '../../../utils/validators';
import * as authUtils from '../../../utils/authUtils';
import { sendVerificationEmailHandler } from '../sendVerificationEmailHandler';
import * as dbErrorParser from '../../../utils/dbErrorParser';
import * as firebaseUtils from '../../../utils/firebaseUidToUuid';

type Mock = jest.Mock;

jest.mock('../../../models/auth/user/user.service');
jest.mock('../../../utils/validators');
jest.mock('../../../utils/authUtils');
jest.mock('../sendVerificationEmailHandler');
jest.mock('../../../utils/dbErrorParser');
jest.mock('../../../utils/firebaseUidToUuid');

const mockRegisterUser = UserService.registerUser as Mock;
const mockIsValidEmail = validators.isValidEmail as Mock;
const mockIsValidPhone = validators.isValidPhone as Mock;
const mockEmailExists = authUtils.emailExists as Mock;
const mockPhoneExists = authUtils.phoneExists as Mock;
const mockAuthenticateCaller = authUtils.authenticateCaller as Mock;
const mockSendVerificationEmail = sendVerificationEmailHandler as Mock;
const mockParseDbError = dbErrorParser.parseDbError as Mock;
const mockFirebaseUidToUuid = firebaseUtils.firebaseUidToUuid as Mock;

describe('registerUserHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidEmail.mockReturnValue(true);
    mockIsValidPhone.mockReturnValue(true);
    mockEmailExists.mockResolvedValue(true);
    mockPhoneExists.mockResolvedValue(true);
    mockAuthenticateCaller.mockResolvedValue({ success: true });
    mockFirebaseUidToUuid.mockReturnValue('uuid-123');
  });

  function makeReq(data: any, uid: string = 'uid123') {
    return {
      data,
      auth: { uid },
    } as unknown as CallableRequest<RegisterUserData>;
  }

  const validData: RegisterUserData = {
    name: { en: 'Test User', ar: 'تيمبت' },
    email: 'test@example.com',
    phone: '+1234567890',
    role: 'user',
    twoFaEnabled: false,
  };

  it('returns issues for missing fields', async () => {
    const result = await registerUserHandler(makeReq({}));
    expect(result.success).toBe(false);
    // 6 required fields: uid, name, twoFaEnabled, email, phone, role
    expect(result.issues).toHaveLength(6);
  });

  it('returns issues for invalid email format', async () => {
    mockIsValidEmail.mockReturnValue(false);
    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({
      success: false,
      issues: [{ field: 'email', message: 'Invalid email format' }],
    });
  });

  it('returns issues for email that has no record registered', async () => {
    mockEmailExists.mockResolvedValue(false);
    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({
      success: false,
      issues: [{ field: 'email', message: 'Email has no record registered' }],
    });
  });

  it('returns success on valid registration', async () => {
    mockRegisterUser.mockResolvedValue(undefined);
    mockSendVerificationEmail.mockResolvedValue({ success: true });

    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({ success: true, emailSent: true });
  });

  it('returns database issues on persistence failure', async () => {
    const dbError = new Error('DB constraint');
    mockRegisterUser.mockRejectedValue(dbError);
    mockParseDbError.mockReturnValue([{ field: 'db', message: 'constraint' }]);

    const result = await registerUserHandler(makeReq(validData));
    expect(result.success).toBe(false);
    expect(result.issues).toEqual([{ field: 'db', message: 'constraint' }]);
  });

  it('returns success but emailSent=false when verification fails', async () => {
    mockRegisterUser.mockResolvedValue(undefined);
    mockSendVerificationEmail.mockRejectedValue(new Error('Email failed'));

    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({ success: true, emailSent: false });
  });

  it('returns auth failure if authenticateCaller fails', async () => {
    mockAuthenticateCaller.mockResolvedValue({
      success: false,
      issues: [{ field: 'auth', message: 'Unauthorized' }],
    });
    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({
      success: false,
      issues: [{ field: 'auth', message: 'Unauthorized' }],
    });
  });
});
