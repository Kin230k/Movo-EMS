import { sendPasswordResetHandler } from '../sendPasswordResetHandler';
import * as adminAuth from 'firebase-admin/auth';
import * as emailService from '../../../services/emailService';
import { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/auth');
jest.mock('../../../services/emailService');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const mockedGenerateLink = jest.fn();
(adminAuth.getAuth as jest.Mock).mockReturnValue({
  generatePasswordResetLink: mockedGenerateLink,
});

const mockedSendEmail = emailService.sendEmail as jest.Mock;

const makeRequest = (data: any): CallableRequest<any> =>
  ({
    data,
    auth: undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as CallableRequest<any>);

describe('sendPasswordResetHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns issues if email missing', async () => {
    const result = await sendPasswordResetHandler(makeRequest({}));
    expect(result).toEqual({
      success: false,
      issues: [
        { field: 'email', message: 'Email required' },
        { field: 'email', message: 'Invalid email format' },
      ],
    });
  });

  it('returns general error on failure', async () => {
    mockedGenerateLink.mockRejectedValueOnce(new Error('Auth error'));

    const result = await sendPasswordResetHandler(
      makeRequest({ email: 'user@example.com' })
    );

    expect(result).toEqual({
      success: false,
      issues: [{ field: 'general', message: 'Auth error' }],
    });
  });

  it('sends email on success', async () => {
    mockedGenerateLink.mockResolvedValueOnce('https://reset.link/token');
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await sendPasswordResetHandler(
      makeRequest({ email: 'user@example.com' })
    );

    expect(result).toEqual({ success: true });
    expect(mockedSendEmail).toHaveBeenCalledWith(
      'user@example.com',
      'PASSWORD_RESET',
      ['User', 'https://reset.link/token']
    );
  });
});
