import { sendPasswordResetHandler } from '../sendPasswordResetHandler';
import * as adminAuth from 'firebase-admin/auth';
import * as emailService from '../../../services/emailService';
import { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/auth');
jest.mock('../../../services/emailService');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const generateLinkMock = jest.fn();
(adminAuth.getAuth as jest.Mock).mockReturnValue({
  generatePasswordResetLink: generateLinkMock,
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

  it('throws invalid-argument if email missing', async () => {
    await expect(
      sendPasswordResetHandler(makeRequest({}))
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('sends email on success', async () => {
    generateLinkMock.mockResolvedValueOnce('https://reset.link/token');
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
