// __tests__/sendPasswordResetHandler.test.ts
import { sendPasswordResetHandler } from '../sendPasswordResetHandler';
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

const generateLinkMock = jest.fn();
(adminAuth.getAuth as jest.Mock).mockReturnValue({
  generatePasswordResetLink: generateLinkMock,
});

const mockedSendEmail = emailService.sendEmail as jest.Mock;
const mockedLoggerError = functions.logger.error as jest.Mock;
const fakeContext = {} as functions.https.CallableContext;

describe('sendPasswordResetHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws invalid-argument if email is missing', async () => {
    await expect(
      sendPasswordResetHandler({} as any, fakeContext)
    ).rejects.toMatchObject({
      code: 'invalid-argument',
      message: expect.stringContaining('Email required'),
    });
  });

  it('generates link and sends email on success', async () => {
    generateLinkMock.mockResolvedValueOnce('https://reset.link/token');
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await sendPasswordResetHandler(
      { email: 'user@example.com' },
      fakeContext
    );

    expect(generateLinkMock).toHaveBeenCalledWith('user@example.com');
    expect(mockedSendEmail).toHaveBeenCalledWith(
      'user@example.com',
      'PASSWORD_RESET',
      ['User', 'https://reset.link/token']
    );
    expect(result).toEqual({ success: true });
  });

  it('logs and throws internal if generatePasswordResetLink fails', async () => {
    const linkErr = new Error('Link service down');
    generateLinkMock.mockRejectedValueOnce(linkErr);

    await expect(
      sendPasswordResetHandler({ email: 'fail@example.com' }, fakeContext)
    ).rejects.toMatchObject({
      code: 'internal',
      message: expect.stringContaining('Link service down'),
    });

    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Password reset error:',
      linkErr
    );
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it('logs and throws internal if sendEmail fails', async () => {
    generateLinkMock.mockResolvedValueOnce('https://reset.link/xyz');
    const emailErr = new Error('SMTP error');
    mockedSendEmail.mockRejectedValueOnce(emailErr);

    await expect(
      sendPasswordResetHandler({ email: 'user2@example.com' }, fakeContext)
    ).rejects.toMatchObject({
      code: 'internal',
      message: expect.stringContaining('SMTP error'),
    });

    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Password reset error:',
      emailErr
    );
  });
});
