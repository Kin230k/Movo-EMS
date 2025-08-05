import { CallableRequest } from 'firebase-functions/https';

import { RegisterUserData, registerUserHandler } from '../registerUserHandler';
import { UserService } from '../../../models/auth/user/user.service';
import * as validators from '../../../utils/validators';
import * as authUtils from '../../../utils/authUtils';
import { sendVerificationEmailHandler } from '../sendVerificationEmailHandler';

jest.mock('../../../models/auth/user/user.service');
jest.mock('../../../utils/validators');
jest.mock('../../../utils/authUtils');
jest.mock('../sendVerificationEmailHandler');

const mockRegisterUser = UserService.registerUser as jest.Mock;
const mockIsValidEmail = validators.isValidEmail as jest.Mock;
const mockIsValidPhone = validators.isValidPhone as jest.Mock;
const mockEmailExists = authUtils.emailExists as jest.Mock;
const mockPhoneExists = authUtils.phoneExists as jest.Mock;
const mockSendVerificationEmail = sendVerificationEmailHandler as jest.Mock;

describe('registerUserHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsValidEmail.mockReturnValue(true);
    mockIsValidPhone.mockReturnValue(true);
    mockEmailExists.mockResolvedValue(false);
    mockPhoneExists.mockResolvedValue(false);
  });

  function makeReq(data: any) {
    return { data } as CallableRequest<RegisterUserData>;
  }

  const validData = {
    uid: 'uid123',
    name: { en: 'Test User' },
    email: 'test@example.com',
    phone: '+1234567890',
    role: 'user',
    status: 'active',
    twoFaEnabled: false,
  };

  it('returns issues for missing fields', async () => {
    const result = await registerUserHandler(makeReq({}));
    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(7);
  });

  it('returns issues for invalid email format', async () => {
    mockIsValidEmail.mockReturnValue(false);
    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({
      success: false,
      issues: [{ field: 'email', message: 'Invalid email format' }],
    });
  });

  it('returns issues for duplicate email', async () => {
    mockEmailExists.mockResolvedValue(true);
    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({
      success: false,
      issues: [{ field: 'email', message: 'Email already registered' }],
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

    const result = await registerUserHandler(makeReq(validData));
    expect(result.success).toBe(false);
    expect(result.issues).toBeDefined();
  });

  it('returns success but emailSent=false when verification fails', async () => {
    mockRegisterUser.mockResolvedValue(undefined);
    mockSendVerificationEmail.mockRejectedValue(new Error('Email failed'));

    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({ success: true, emailSent: false });
  });
});
