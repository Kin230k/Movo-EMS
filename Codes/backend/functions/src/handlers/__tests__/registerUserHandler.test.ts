import * as adminAuth from 'firebase-admin/auth';
import { sendEmail } from '../../utils/emailService';
import userMapper from '../../models/auth/user/user.mapper';
import * as logger from 'firebase-functions/logger';
import { registerUserHandler } from '../registerUserHandler';
import { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/auth');
jest.mock('../../utils/emailService');
jest.mock('../../models/auth/user/user.mapper');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const mockedSendEmail = sendEmail as jest.Mock;
const mockedSave = userMapper.save as jest.Mock;
const mockedLoggerError = logger.error as jest.Mock;

const createUserMock = jest.fn();
const generateLinkMock = jest.fn();
const deleteUserMock = jest.fn();

(adminAuth.getAuth as jest.Mock).mockReturnValue({
  createUser: createUserMock,
  generateEmailVerificationLink: generateLinkMock,
  deleteUser: deleteUserMock,
});

const makeRequest = (data: any): CallableRequest<any> =>
  ({
    data,
    auth: undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as CallableRequest<any>);

describe('registerUserHandler', () => {
  const baseData = {
    name: { en: 'Test Name', ar: 'اسم الاختبار' },
    status: 'pending',
    twoFaEnabled: false,
    email: 'u@example.com',
    password: 'secret123',
    displayName: 'Test User',
    phone: '+1234567890',
    picture: 'https://pic.url/avatar.png',
    role: 'tester',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws invalid-argument if required fields missing', async () => {
    await expect(registerUserHandler(makeRequest({}))).rejects.toMatchObject({
      code: 'invalid-argument',
    });
  });

  it('throws internal if createUser fails', async () => {
    const createErr = new Error('Auth down');
    createUserMock.mockRejectedValueOnce(createErr);

    await expect(
      registerUserHandler(makeRequest(baseData))
    ).rejects.toMatchObject({ code: 'internal' });

    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Registration error:',
      createErr
    );
  });

  it('cleans up and throws if link generation fails', async () => {
    createUserMock.mockResolvedValueOnce({ uid: 'new-uid' });
    const linkErr = new Error('Link service down');
    generateLinkMock.mockRejectedValueOnce(linkErr);

    await expect(
      registerUserHandler(makeRequest(baseData))
    ).rejects.toMatchObject({ code: 'internal' });

    expect(deleteUserMock).toHaveBeenCalledWith('new-uid');
    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Post-creation error:',
      linkErr
    );
  });

  it('returns uid on successful register', async () => {
    createUserMock.mockResolvedValueOnce({ uid: 'final-uid' });
    generateLinkMock.mockResolvedValueOnce('https://verify.link/ok');
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await registerUserHandler(makeRequest(baseData));
    expect(result).toEqual({ uid: 'final-uid' });
  });
});
