import { changeUserEmailHandler } from '../changeUserEmailHandler';
import * as emailService from '../../../services/emailService';
import * as adminAuth from 'firebase-admin/auth';
import * as logger from 'firebase-functions/logger';
import { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('../../../services/emailService');
jest.mock('firebase-admin/auth');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const mockedSendEmail = emailService.sendEmail as jest.Mock;
const mockedGetAuth = (adminAuth.getAuth as jest.Mock).mockReturnValue({
  getUser: jest.fn(),
  updateUser: jest.fn(),
});
const mockedLoggerError = logger.error as jest.Mock;

const makeRequest = (data: any, uid?: string): CallableRequest<any> =>
  ({
    data,
    auth: uid ? { uid } : undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as CallableRequest<any>);

describe('changeUserEmailHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns issues if not signed in', async () => {
    const result = await changeUserEmailHandler(
      makeRequest({ newEmail: 'x@y.com' })
    );
    expect(result).toEqual({
      success: false,
      issues: [{ field: 'auth', message: 'Must be signed in to change email' }],
    });
  });

  it('returns issues if newEmail is missing', async () => {
    const result = await changeUserEmailHandler(makeRequest({}, 'uid123'));
    expect(result).toEqual({
      success: false,
      issues: [
        { field: 'newEmail', message: 'newEmail is required' },
        { field: 'newEmail', message: 'Invalid newEmail format' },
      ],
    });
  });

  it('returns issues if getUser rejects', async () => {
    mockedGetAuth().getUser.mockRejectedValueOnce(new Error('User not found'));
    const result = await changeUserEmailHandler(
      makeRequest({ newEmail: 'a@b.com' }, 'uid123')
    );
    expect(result).toEqual({
      success: false,
      issues: [{ field: 'uid', message: 'User not found' }],
    });
  });

  it('returns issues if updateUser fails', async () => {
    mockedGetAuth().getUser.mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });

    const err = new Error('update failed');
    mockedGetAuth().updateUser.mockRejectedValueOnce(err);

    const result = await changeUserEmailHandler(
      makeRequest({ newEmail: 'new@e.com' }, 'uid123')
    );

    expect(result).toEqual({
      success: false,
      issues: [{ field: 'newEmail', message: 'update failed' }],
    });
    expect(mockedLoggerError).toHaveBeenCalledWith('Auth update error:', err);
  });

  it('swallows sendEmail errors and returns success', async () => {
    mockedGetAuth().getUser.mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });
    mockedGetAuth().updateUser.mockResolvedValueOnce({});

    const notifyErr = new Error('SMTP down');
    mockedSendEmail.mockRejectedValueOnce(notifyErr);

    const result = await changeUserEmailHandler(
      makeRequest({ newEmail: 'new@e.com' }, 'uid123')
    );

    expect(result).toEqual({ success: true });
    expect(mockedSendEmail).toHaveBeenCalledWith('old@e.com', 'EMAIL_CHANGE', [
      'Old Name',
      'new@e.com',
    ]);
    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Email notification error:',
      notifyErr
    );
  });

  it('sends email and returns success', async () => {
    mockedGetAuth().getUser.mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });
    mockedGetAuth().updateUser.mockResolvedValueOnce({});
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await changeUserEmailHandler(
      makeRequest({ newEmail: 'new@e.com' }, 'uid123')
    );

    expect(result).toEqual({ success: true });
    expect(mockedSendEmail).toHaveBeenCalledWith('old@e.com', 'EMAIL_CHANGE', [
      'Old Name',
      'new@e.com',
    ]);
  });
});
