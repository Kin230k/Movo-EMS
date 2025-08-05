import { checkServiceStatusHandler } from '../checkServiceStatusHandler';
import * as emailService from '../../../services/emailService';
import { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('../../../services/emailService');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const mockedSendEmail = emailService.sendEmail as jest.Mock;

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

  it('returns issues if email missing', async () => {
    const result = await checkServiceStatusHandler(makeRequest({}));
    expect(result).toEqual({
      success: false,
      issues: [
        { field: 'email', message: 'Email is required' },
        { field: 'email', message: 'Invalid email format' },
      ],
    });
  });
});

it('sends email and returns success', async () => {
  mockedSendEmail.mockResolvedValueOnce(undefined);
  const result = await checkServiceStatusHandler(
    makeRequest({ email: 'test@example.com' })
  );

  expect(result).toEqual({ success: true });
  expect(mockedSendEmail).toHaveBeenCalledWith(
    'test@example.com',
    'SERVICE_STATUS',
    ['User', '✅ The service is up and running!']
  );
});
