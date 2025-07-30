import { checkServiceStatusHandler } from '../checkServiceStatusHandler';
import * as emailService from '../../utils/emailService';
import * as logger from 'firebase-functions/logger';
import { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('../../utils/emailService');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const mockedSendEmail = emailService.sendEmail as jest.Mock;
const mockedLoggerError = logger.error as jest.Mock;

const makeRequest = (data: any): CallableRequest<any> =>
  ({
    data,
    auth: undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as CallableRequest<any>);

describe('checkServiceStatusHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error if email missing', async () => {
    await expect(checkServiceStatusHandler(makeRequest({}))).rejects.toThrow(
      'Email is required'
    );
  });

  it('sends email and returns success', async () => {
    mockedSendEmail.mockResolvedValueOnce(undefined);
    const result = await checkServiceStatusHandler(
      makeRequest({ email: 'test@example.com' })
    );

    expect(result).toEqual({
      status: 'ok',
      message: 'Email sent successfully',
    });
    expect(mockedSendEmail).toHaveBeenCalledWith(
      'test@example.com',
      'SERVICE_STATUS',
      ['User', '✅ The service is up and running!']
    );
  });
});
