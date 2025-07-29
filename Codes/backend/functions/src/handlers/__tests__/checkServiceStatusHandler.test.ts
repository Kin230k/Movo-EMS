import { checkServiceStatusHandler } from '../checkServiceStatusHandler';
import * as emailService from '../../utils/emailService';
import * as functions from 'firebase-functions';

jest.mock('../../utils/emailService');
jest.mock('firebase-functions', () => ({
  ...jest.requireActual('firebase-functions'),
  logger: {
    error: jest.fn(),
  },
}));

const mockedSendEmail = emailService.sendEmail as unknown as jest.Mock;
const mockedLoggerError = functions.logger.error as unknown as jest.Mock;

// A dummy context—handler doesn’t use it, but TS requires it
const fakeContext = {} as functions.https.CallableContext;

describe('checkServiceStatusHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if email is missing', async () => {
    await expect(
      checkServiceStatusHandler({} as any, fakeContext)
    ).rejects.toThrow(/Email is required/);
  });

  it('should call sendEmail and return success if email is provided', async () => {
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await checkServiceStatusHandler(
      { email: 'test@example.com' },
      fakeContext
    );

    expect(mockedSendEmail).toHaveBeenCalledWith(
      'test@example.com',
      'SERVICE_STATUS',
      ['User', '✅ The service is up and running!']
    );
    expect(result).toEqual({
      status: 'ok',
      message: 'Email sent successfully',
    });
  });

  it('should throw an internal error and log if sendEmail fails', async () => {
    const testError = new Error('SMTP failed');
    mockedSendEmail.mockRejectedValueOnce(testError);

    await expect(
      checkServiceStatusHandler({ email: 'test@example.com' }, fakeContext)
    ).rejects.toThrow(/Failed to send status email/);

    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Service status check failed:',
      testError
    );
  });
});
