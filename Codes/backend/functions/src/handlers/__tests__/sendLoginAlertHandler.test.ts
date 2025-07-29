// __tests__/sendLoginAlertHandler.test.ts
import { sendLoginAlertHandler } from '../sendLoginAlertHandler';
import * as adminAuth from 'firebase-admin/auth';
import * as emailService from '../../utils/emailService';
import * as functions from 'firebase-functions';

jest.mock('firebase-admin/auth');
jest.mock('../../utils/emailService');
jest.mock('firebase-functions', () => ({
  ...jest.requireActual('firebase-functions'),
  logger: {
    error: jest.fn(),
  },
}));

const mockedGetAuth = (adminAuth.getAuth as jest.Mock).mockReturnValue({
  getUser: jest.fn(),
});
const mockedSendEmail = emailService.sendEmail as jest.Mock;
const mockedLoggerError = functions.logger.error as jest.Mock;

// helper to build context
const makeContext = (uid?: string): functions.https.CallableContext =>
  ({
    auth: uid ? { uid, token: {}, getIdTokenResult: jest.fn() } : null,
  } as any);

describe('sendLoginAlertHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws unauthenticated if context.auth is missing', async () => {
    await expect(
      sendLoginAlertHandler({ device: 'Chrome' }, makeContext())
    ).rejects.toMatchObject({
      code: 'unauthenticated',
      message: expect.stringContaining('Auth required'),
    });
  });

  it('throws failed-precondition if user.email is missing', async () => {
    // getUser returns user without email
    (mockedGetAuth().getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'u1',
      email: undefined,
      displayName: 'Name',
    });

    await expect(
      sendLoginAlertHandler({}, makeContext('u1'))
    ).rejects.toMatchObject({
      code: 'failed-precondition',
      message: expect.stringContaining('User email missing'),
    });

    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Login alert error:',
      expect.anything()
    );
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it('throws internal if getUser fails with generic error', async () => {
    const authErr = new Error('Auth fetch failed');
    (mockedGetAuth().getUser as jest.Mock).mockRejectedValueOnce(authErr);

    await expect(
      sendLoginAlertHandler({}, makeContext('u2'))
    ).rejects.toMatchObject({
      code: 'internal',
      message: expect.stringContaining('Auth fetch failed'),
    });

    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Login alert error:',
      authErr
    );
  });

  it('sends email with provided device and returns success', async () => {
    (mockedGetAuth().getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'u3',
      email: 'user@x.com',
      displayName: 'TestUser',
    });
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await sendLoginAlertHandler(
      { device: 'Firefox on Mac' },
      makeContext('u3')
    );

    expect(mockedSendEmail).toHaveBeenCalledWith('user@x.com', 'LOGIN_ALERT', [
      'TestUser',
      'Firefox on Mac',
    ]);
    expect(result).toEqual({ success: true });
  });

  it('uses "Unknown device" when device not provided', async () => {
    (mockedGetAuth().getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'u4',
      email: 'me@domain.com',
      displayName: undefined,
    });
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await sendLoginAlertHandler({}, makeContext('u4'));

    expect(mockedSendEmail).toHaveBeenCalledWith(
      'me@domain.com',
      'LOGIN_ALERT',
      ['User', 'Unknown device']
    );
    expect(result).toEqual({ success: true });
  });

  it('wraps sendEmail errors as internal', async () => {
    (mockedGetAuth().getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'u5',
      email: 'u5@x.com',
      displayName: 'U5',
    });
    const mailErr = new Error('SMTP down');
    mockedSendEmail.mockRejectedValueOnce(mailErr);

    await expect(
      sendLoginAlertHandler({ device: 'iOS' }, makeContext('u5'))
    ).rejects.toMatchObject({
      code: 'internal',
      message: expect.stringContaining('SMTP down'),
    });

    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Login alert error:',
      mailErr
    );
  });

  it('rethrows HttpsError without wrapping', async () => {
    // simulate getUser returning user without email to trigger HttpsError
    (mockedGetAuth().getUser as jest.Mock).mockResolvedValueOnce({
      uid: 'u6',
      email: undefined,
      displayName: 'X',
    });

    await expect(
      sendLoginAlertHandler({}, makeContext('u6'))
    ).rejects.toMatchObject({
      code: 'failed-precondition',
    });

    // ensure it was thrown as-is, not wrapped
    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Login alert error:',
      expect.anything()
    );
  });
});
