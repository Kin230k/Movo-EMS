import { sendLoginAlertHandler } from '../sendLoginAlertHandler';
import * as adminAuth from 'firebase-admin/auth';
import * as emailService from '../../utils/emailService';
import * as logger from 'firebase-functions/logger';
import { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/auth');
jest.mock('../../utils/emailService');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const mockedGetAuth = (adminAuth.getAuth as jest.Mock).mockReturnValue({
  getUser: jest.fn(),
});
const mockedSendEmail = emailService.sendEmail as jest.Mock;
const mockedLoggerError = logger.error as jest.Mock;

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
  });

  it('throws unauthenticated if context.auth missing', async () => {
    await expect(
      sendLoginAlertHandler(makeRequest({ device: 'Chrome' }))
    ).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  it('sends email with provided device', async () => {
    mockedGetAuth().getUser.mockResolvedValueOnce({
      uid: 'u3',
      email: 'user@x.com',
      displayName: 'TestUser',
    });
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await sendLoginAlertHandler(
      makeRequest({ device: 'Firefox on Mac' }, 'u3')
    );

    expect(mockedSendEmail).toHaveBeenCalledWith('user@x.com', 'LOGIN_ALERT', [
      'TestUser',
      'Firefox on Mac',
    ]);
    expect(result).toEqual({ success: true });
  });

  it('uses "Unknown device" when device not provided', async () => {
    mockedGetAuth().getUser.mockResolvedValueOnce({
      uid: 'u4',
      email: 'me@domain.com',
      displayName: undefined,
    });
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await sendLoginAlertHandler(makeRequest({}, 'u4'));

    expect(mockedSendEmail).toHaveBeenCalledWith(
      'me@domain.com',
      'LOGIN_ALERT',
      ['User', 'Unknown device']
    );
  });
});
