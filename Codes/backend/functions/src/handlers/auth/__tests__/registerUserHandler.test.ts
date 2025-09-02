import { CallableRequest } from 'firebase-functions/v2/https';
import admin from 'firebase-admin';
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

// mock firebase-admin getUser
const mockGetUser = jest.fn();

describe('registerUserHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // ensure admin.auth().getUser(...) is mocked to return email/phone by default
    jest.spyOn(admin, 'auth').mockImplementation(
      () =>
        ({
          getUser: mockGetUser,
        } as any)
    );

    mockGetUser.mockResolvedValue({
      email: 'test@example.com',
      phoneNumber: '+1234567890',
    });

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

  // NOTE: RegisterUserData (handler) only includes name, twoFaEnabled, picture (email/phone come from Firebase Auth)
  const validData: RegisterUserData = {
    name: { en: 'Test User', ar: 'تيمت' },
  };

  it('returns issues for missing fields', async () => {
    // makeReq({}) still includes auth.uid by default, so missing client-side fields are name & twoFaEnabled
    const result = await registerUserHandler(makeReq({}));
    expect(result.success).toBe(false);
    // Only the client-side required fields: name and twoFaEnabled
    expect(result.issues).toHaveLength(2);
    // ensure the two fields are the expected ones
    expect(result.issues).toEqual(
      expect.arrayContaining([
        { field: 'name', message: 'Name is required' },
        { field: 'twoFaEnabled', message: '2FA setting required' },
      ])
    );
  });

  it('returns issues for invalid email format', async () => {
    mockIsValidEmail.mockReturnValue(false);
    // ensure firebase returns an email (it does by default via mockGetUser)
    const result = await registerUserHandler(makeReq(validData));
    expect(result).toEqual({
      success: false,
      issues: [
        { field: 'email', message: 'Email from Auth has invalid format' },
      ],
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
