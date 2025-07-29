// __tests__/registerUserHandler.test.ts
import { registerUserHandler } from '../registerUserHandler';
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

const mockedSendEmail = emailService.sendEmail as jest.Mock;
const mockedLoggerError = functions.logger.error as jest.Mock;

const createUserMock = jest.fn();
const generateLinkMock = jest.fn();
const deleteUserMock = jest.fn();

// Mock getAuth() to return our spies
(adminAuth.getAuth as jest.Mock).mockReturnValue({
  createUser: createUserMock,
  generateEmailVerificationLink: generateLinkMock,
  deleteUser: deleteUserMock,
});

const fakeContext = {} as functions.https.CallableContext;

describe('registerUserHandler', () => {
  const baseData = {
    email: 'u@example.com',
    password: 'secret123',
    displayName: 'Test User',
    phone: '+1234567890',
    pictureUrl: 'https://pic.url/avatar.png',
    role: 'tester',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure deleteUser returns a promise so .catch works
    deleteUserMock.mockResolvedValue(undefined);
  });

  it('throws invalid-argument if required fields are missing', async () => {
    await expect(
      registerUserHandler({} as any, fakeContext)
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('throws internal if createUser fails', async () => {
    const createErr = new Error('Auth down');
    createUserMock.mockRejectedValueOnce(createErr);

    const p = registerUserHandler(baseData, fakeContext);
    await expect(p).rejects.toMatchObject({ code: 'internal' });
    await expect(p).rejects.toThrow('Auth down');

    expect(mockedLoggerError).toHaveBeenCalledWith(
      'registerUser error:',
      createErr
    );
  });

  it('cleans up and throws if Phase B (link or email) fails', async () => {
    createUserMock.mockResolvedValueOnce({ uid: 'new-uid' });
    const postErr = new Error('Link service down');
    generateLinkMock.mockRejectedValueOnce(postErr);

    const p = registerUserHandler(baseData, fakeContext);
    await expect(p).rejects.toMatchObject({ code: 'internal' });
    await expect(p).rejects.toThrow('Link service down');

    expect(deleteUserMock).toHaveBeenCalledWith('new-uid');
    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Post‐creation error:',
      postErr
    );
  });

  it('cleans up and throws if sendEmail fails', async () => {
    createUserMock.mockResolvedValueOnce({ uid: 'uid-2' });
    generateLinkMock.mockResolvedValueOnce('https://verify.link/token');
    const emailErr = new Error('SMTP error');
    mockedSendEmail.mockRejectedValueOnce(emailErr);

    const p = registerUserHandler(baseData, fakeContext);
    await expect(p).rejects.toMatchObject({ code: 'internal' });
    await expect(p).rejects.toThrow('SMTP error');

    expect(deleteUserMock).toHaveBeenCalledWith('uid-2');
    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Post‐creation error:',
      emailErr
    );
  });

  it('returns uid on successful register', async () => {
    createUserMock.mockResolvedValueOnce({ uid: 'final-uid' });
    generateLinkMock.mockResolvedValueOnce('https://verify.link/ok');
    mockedSendEmail.mockResolvedValueOnce(undefined);

    const result = await registerUserHandler(baseData, fakeContext);
    expect(result).toEqual({ uid: 'final-uid' });

    expect(createUserMock).toHaveBeenCalledWith({
      email: baseData.email,
      password: baseData.password,
      displayName: baseData.displayName,
      phoneNumber: baseData.phone,
      photoURL: baseData.pictureUrl,
    });

    expect(generateLinkMock).toHaveBeenCalledWith(baseData.email);
    expect(mockedSendEmail).toHaveBeenCalledWith(
      baseData.email,
      'VERIFICATION',
      [baseData.displayName, 'https://verify.link/ok']
    );
    expect(deleteUserMock).not.toHaveBeenCalled();
  });
});
