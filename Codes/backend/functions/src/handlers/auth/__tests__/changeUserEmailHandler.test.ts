import { changeUserEmailHandler } from '../changeUserEmailHandler';
import * as emailService from '../../../services/emailService';
import * as adminAuth from 'firebase-admin/auth';
import * as logger from 'firebase-functions/logger';
import { UserService } from '../../../models/auth/user/user.service';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';
import { CallableRequest } from 'firebase-functions/v2/https';

type Mock = jest.Mock;

// Mock out all external dependencies
jest.mock('../../../services/emailService');
jest.mock('firebase-admin/auth');
jest.mock('firebase-functions/logger', () => ({ error: jest.fn() }));
jest.mock('../../../models/auth/user/user.service');
jest.mock('../../../utils/firebaseUidToUuid', () => ({
  firebaseUidToUuid: jest.fn((uid: string) => uid),
}));

const mockedSendEmail = emailService.sendEmail as unknown as Mock;
const getAuthMock = adminAuth.getAuth as unknown as Mock;
getAuthMock.mockReturnValue({
  getUser: jest.fn(),
  updateUser: jest.fn(),
});
const mockedLoggerError = logger.error as unknown as Mock;
const mockedChangeEmail = UserService.changeEmail as unknown as Mock;
mockedChangeEmail.mockResolvedValue(undefined);
const mockedUidConverter = firebaseUidToUuid as unknown as Mock;

// Helper to build a fake CallableRequest

type Req = CallableRequest<any>;
function makeReq(data: any, uid?: string): Req {
  return {
    data,
    auth: uid ? { uid } : undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as Req;
}

describe('changeUserEmailHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns combined validation issues when not signed in', async () => {
    const res = await changeUserEmailHandler(makeReq({}));
    expect(res).toEqual({
      success: false,
      issues: [
        { field: 'auth', message: 'Must be signed in to change email' },
        { field: 'newEmail', message: 'newEmail is required' },
        { field: 'newEmail', message: 'Invalid newEmail format' },
      ],
    });
  });

  it('returns email validation issues if missing or invalid when signed in', async () => {
    const res = await changeUserEmailHandler(makeReq({}, 'uid123'));
    expect(res).toEqual({
      success: false,
      issues: [
        { field: 'newEmail', message: 'newEmail is required' },
        { field: 'newEmail', message: 'Invalid newEmail format' },
      ],
    });
  });

  it('returns issues if getUser rejects', async () => {
    const auth = getAuthMock();
    (auth.getUser as jest.Mock).mockRejectedValueOnce(
      new Error('User not found')
    );

    const res = await changeUserEmailHandler(
      makeReq({ newEmail: 'a@b.com' }, 'uid123')
    );
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'uid', message: 'User not found' }],
    });
  });

  it('returns issues if updateUser fails', async () => {
    const auth = getAuthMock();
    (auth.getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });
    const err = new Error('update failed');
    (auth.updateUser as jest.Mock).mockRejectedValueOnce(err);

    const res = await changeUserEmailHandler(
      makeReq({ newEmail: 'new@e.com' }, 'uid123')
    );
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'newEmail', message: 'update failed' }],
    });
    expect(mockedLoggerError).toHaveBeenCalledWith('Auth update error:', err);
    expect(mockedChangeEmail).not.toHaveBeenCalled();
  });

  it('returns success and sends notification on valid update', async () => {
    const auth = getAuthMock();
    (auth.getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });
    (auth.updateUser as jest.Mock).mockResolvedValueOnce({});

    const res = await changeUserEmailHandler(
      makeReq({ newEmail: 'new@e.com' }, 'uid123')
    );
    expect(res).toEqual({ success: true });
    expect(mockedUidConverter).toHaveBeenCalledWith('uid123');
    expect(mockedChangeEmail).toHaveBeenCalledWith('uid123', 'new@e.com');
    expect(mockedSendEmail).toHaveBeenCalledWith('old@e.com', 'EMAIL_CHANGE', [
      'Old Name',
      'new@e.com',
    ]);
  });

  it('returns issues when service layer changeEmail fails', async () => {
    const auth = getAuthMock();
    (auth.getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });
    (auth.updateUser as jest.Mock).mockResolvedValueOnce({});
    const svcErr = new Error('service down');
    mockedChangeEmail.mockRejectedValueOnce(svcErr);

    const res = await changeUserEmailHandler(
      makeReq({ newEmail: 'new@e.com' }, 'uid123')
    );
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'newEmail', message: 'service down' }],
    });
    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Auth update error:',
      svcErr
    );
  });
});
