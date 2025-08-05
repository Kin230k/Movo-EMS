// src/handlers/auth/__tests__/changeUserPhoneHandler.test.ts
import { changeUserPhoneHandler } from '../changeUserPhoneHandler';
import * as adminAuth from 'firebase-admin/auth';
import * as logger from 'firebase-functions/logger';
import { UserService } from '../../../models/auth/user/user.service';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { isValidPhone } from '../../../utils/validators';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';

jest.mock('firebase-admin/auth');
jest.mock('firebase-functions/logger', () => ({ error: jest.fn() }));
jest.mock('../../../models/auth/user/user.service');
jest.mock('../../../utils/validators');

type Mock = jest.Mock;
const getAuthMock = adminAuth.getAuth as unknown as Mock;
getAuthMock.mockReturnValue({
  getUser: jest.fn(),
  updateUser: jest.fn(),
});
const mockedLoggerError = logger.error as unknown as Mock;
const mockedChangePhone = UserService.changePhone as unknown as Mock;
mockedChangePhone.mockResolvedValue(undefined);
const mockedIsValidPhone = isValidPhone as unknown as Mock;

// Helper to build request
function makeReq(data: any, uid?: string): CallableRequest<any> {
  return {
    data,
    auth: uid ? { uid } : undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as any;
}

describe('changeUserPhoneHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns combined validation issues when not signed in', async () => {
    mockedIsValidPhone.mockReturnValue(false);
    const res = await changeUserPhoneHandler(makeReq({}));
    expect(res).toEqual({
      success: false,
      issues: [
        { field: 'auth', message: 'Must be signed in to change phone number' },
        { field: 'newPhone', message: 'newPhone is required' },
      ],
    });
  });

  it('returns phone validation issues if missing or invalid when signed in', async () => {
    mockedIsValidPhone.mockReturnValue(false);
    const res = await changeUserPhoneHandler(makeReq({}, 'uid123'));
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'newPhone', message: 'newPhone is required' }],
    });

    // also when provided but invalid
    const res2 = await changeUserPhoneHandler(
      makeReq({ newPhone: '123abc' }, 'uid123')
    );
    expect(res2).toEqual({
      success: false,
      issues: [{ field: 'newPhone', message: 'Invalid newPhone format' }],
    });
  });

  it('returns issue if getUser rejects', async () => {
    mockedIsValidPhone.mockReturnValue(true);
    const auth = getAuthMock();
    (auth.getUser as jest.Mock).mockRejectedValueOnce(
      new Error('User not found')
    );

    const res = await changeUserPhoneHandler(
      makeReq({ newPhone: '+1234567890' }, 'uid123')
    );
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'uid', message: 'User not found' }],
    });
  });

  it('returns issues if updateUser fails', async () => {
    mockedIsValidPhone.mockReturnValue(true);
    const auth = getAuthMock();
    (auth.getUser as jest.Mock).mockResolvedValueOnce({ uid: 'uid123' });
    const err = new Error('update failed');
    (auth.updateUser as jest.Mock).mockRejectedValueOnce(err);

    const res = await changeUserPhoneHandler(
      makeReq({ newPhone: '+1234567890' }, 'uid123')
    );
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'newPhone', message: 'update failed' }],
    });
    expect(mockedLoggerError).toHaveBeenCalledWith('Auth update error:', err);
    expect(mockedChangePhone).not.toHaveBeenCalled();
  });

  it('returns success on valid update', async () => {
    mockedIsValidPhone.mockReturnValue(true);
    const auth = getAuthMock();
    (auth.getUser as jest.Mock).mockResolvedValueOnce({ uid: 'uid123' });
    (auth.updateUser as jest.Mock).mockResolvedValueOnce({});

    const res = await changeUserPhoneHandler(
      makeReq({ newPhone: '+1234567890' }, 'uid123')
    );
    expect(res).toEqual({ success: true });
    expect(mockedChangePhone).toHaveBeenCalledWith(
      firebaseUidToUuid('uid123'),
      '+1234567890'
    );
  });

  it('returns issues when service layer changePhone fails', async () => {
    mockedIsValidPhone.mockReturnValue(true);
    const auth = getAuthMock();
    (auth.getUser as jest.Mock).mockResolvedValueOnce({ uid: 'uid123' });
    (auth.updateUser as jest.Mock).mockResolvedValueOnce({});
    const svcErr = new Error('service down');
    mockedChangePhone.mockRejectedValueOnce(svcErr);

    const res = await changeUserPhoneHandler(
      makeReq({ newPhone: '+1234567890' }, 'uid123')
    );
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'newPhone', message: 'service down' }],
    });
    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Auth update error:',
      svcErr
    );
  });
});
