// __tests__/changeUserEmailHandler.test.ts
import { changeUserEmailHandler } from '../changeUserEmailHandler';
import * as emailService from '../../utils/emailService';
import * as adminAuth from 'firebase-admin/auth';
import * as functions from 'firebase-functions';

jest.mock('../../utils/emailService');
jest.mock('firebase-admin/auth');
jest.mock('firebase-functions', () => ({
  ...jest.requireActual('firebase-functions'),
  logger: {
    error: jest.fn(),
  },
}));

const mockedSendEmail = emailService.sendEmail as jest.Mock;
const mockedGetAuth = (adminAuth.getAuth as jest.Mock).mockReturnValue({
  getUser: jest.fn(),
  updateUser: jest.fn(),
});
const mockedLoggerError = functions.logger.error as jest.Mock;

// helper to build a fake context with (optional) auth
const makeContext = (uid?: string): functions.https.CallableContext =>
  ({
    auth: uid ? { uid, token: {}, getIdTokenResult: jest.fn() } : null,
  } as any);

describe('changeUserEmailHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws permission-denied if not signed in', async () => {
    await expect(
      changeUserEmailHandler({ newEmail: 'x@y.com' }, makeContext())
    ).rejects.toMatchObject({
      code: 'permission-denied',
      message: expect.stringContaining('Must be signed in'),
    });
  });

  it('throws invalid-argument if newEmail is missing', async () => {
    await expect(
      changeUserEmailHandler({} as any, makeContext('uid123'))
    ).rejects.toMatchObject({
      code: 'invalid-argument',
      message: expect.stringContaining('newEmail is required'),
    });
  });

  it('throws not-found if getUser rejects', async () => {
    (mockedGetAuth().getUser as jest.Mock).mockRejectedValueOnce(new Error());
    await expect(
      changeUserEmailHandler({ newEmail: 'a@b.com' }, makeContext('uid123'))
    ).rejects.toMatchObject({
      code: 'not-found',
      message: expect.stringContaining('User not found'),
    });
  });

  it('throws internal if updateUser fails', async () => {
    // getUser succeeds
    (mockedGetAuth().getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });
    // updateUser fails
    const err = new Error('update failed');
    (mockedGetAuth().updateUser as jest.Mock).mockRejectedValueOnce(err);

    await expect(
      changeUserEmailHandler({ newEmail: 'new@e.com' }, makeContext('uid123'))
    ).rejects.toMatchObject({
      code: 'internal',
      message: expect.stringContaining('Failed to update auth email'),
    });

    expect(mockedLoggerError).toHaveBeenCalledWith('Auth update error:', err);
  });

  it('swallows sendEmail errors when notifying old email and still returns success', async () => {
    // getUser & updateUser succeed
    (mockedGetAuth().getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });
    (mockedGetAuth().updateUser as jest.Mock).mockResolvedValueOnce({});

    // notification fails
    const notifyErr = new Error('SMTP down');
    mockedSendEmail.mockRejectedValueOnce(notifyErr);

    const result = await changeUserEmailHandler(
      { newEmail: 'new@e.com' },
      makeContext('uid123')
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

  it('calls sendEmail for old email on success and returns success', async () => {
    // getUser & updateUser succeed
    (mockedGetAuth().getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'uid123',
      email: 'old@e.com',
      displayName: 'Old Name',
    });
    (mockedGetAuth().updateUser as jest.Mock).mockResolvedValueOnce({});

    // notification succeeds
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await changeUserEmailHandler(
      { newEmail: 'new@e.com' },
      makeContext('uid123')
    );
    expect(result).toEqual({ success: true });

    expect(mockedSendEmail).toHaveBeenCalledWith('old@e.com', 'EMAIL_CHANGE', [
      'Old Name',
      'new@e.com',
    ]);
  });
});
