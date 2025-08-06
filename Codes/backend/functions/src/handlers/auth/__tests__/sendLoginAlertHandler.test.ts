import { sendLoginAlertHandler } from '../sendLoginAlertHandler';
import * as adminAuth from 'firebase-admin/auth';
import * as emailService from '../../../services/emailService';
import { CallableRequest } from 'firebase-functions/https';

jest.mock('firebase-admin/auth');
jest.mock('../../../services/emailService');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const mockedGetAuth = adminAuth.getAuth as jest.Mock;
const mockedSendEmail = emailService.sendEmail as jest.Mock;

const makeRequest = (data: any, uid?: string): CallableRequest<any> =>
  ({
    data,
    auth: uid ? { uid } : undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as CallableRequest<any>);

describe('sendLoginAlertHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAuth.mockReturnValue({
      getUser: jest.fn(),
    });
  });

  it('returns issues if not signed in', async () => {
    const result = await sendLoginAlertHandler(makeRequest({}));
    expect(result).toEqual({
      success: false,
      issues: [
        { field: 'auth', message: 'Must be signed in to send login alert' },
      ],
    });
  });

  it('returns issues if user email missing', async () => {
    mockedGetAuth().getUser.mockResolvedValueOnce({
      uid: 'u',
      displayName: 'N',
      email: undefined,
    });

    const result = await sendLoginAlertHandler(
      makeRequest({ device: 'X' }, 'u')
    );

    expect(result).toEqual({
      success: false,
      issues: [{ field: 'email', message: 'User email missing' }],
    });
  });

  it('sends with Unknown device when none provided', async () => {
    mockedGetAuth().getUser.mockResolvedValueOnce({
      uid: 'u',
      displayName: 'User',
      email: 'e@d',
    });
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await sendLoginAlertHandler(makeRequest({}, 'u'));
    expect(result).toEqual({ success: true });
    expect(mockedSendEmail).toHaveBeenCalledWith('e@d', 'LOGIN_ALERT', [
      'User',
      'Unknown device',
    ]);
  });

  it('returns general error on failure', async () => {
    mockedGetAuth().getUser.mockRejectedValueOnce(new Error('boom'));

    const result = await sendLoginAlertHandler(makeRequest({}, 'u'));

    expect(result).toEqual({
      success: false,
      issues: [{ field: 'general', message: 'boom' }],
    });
  });
});
