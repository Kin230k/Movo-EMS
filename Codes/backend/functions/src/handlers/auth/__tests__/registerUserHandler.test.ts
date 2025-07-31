// src/handlers/__tests__/registerUserHandler.test.ts

import { registerUserHandler } from '../../registerUserHandler';
import { getAuth } from 'firebase-admin/auth';
import * as emailService from '../../utils/emailService';
import userMapper from '../../../models/auth/user/user.mapper';
import { HttpsError } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/auth');
jest.mock('../../utils/emailService');
jest.mock('../../models/auth/user/user.mapper');

const mockGetAuth = getAuth as unknown as jest.MockedFunction<typeof getAuth>;
const sendEmail = emailService.sendEmail as unknown as jest.Mock;
const saveUser = userMapper.save as unknown as jest.Mock;

describe('registerUserHandler', () => {
  const fakeAuth = {
    getUserByEmail: jest.fn(),
    getUserByPhoneNumber: jest.fn(),
    createUser: jest.fn(),
    generateEmailVerificationLink: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuth.mockReturnValue(fakeAuth as any);
  });

  function makeReq(data: any) {
    return { data } as any;
  }

  const fullData = {
    name: { en: 'A' },
    status: 'new',
    twoFaEnabled: false,
    email: 'x@y.com',
    password: 'p',
    displayName: 'User',
    phone: '+123',
    role: 'user',
    picture: null,
  };

  it('throws invalid-argument if any field missing', async () => {
    await expect(registerUserHandler(makeReq({}))).rejects.toThrow(HttpsError);
  });

  it('throws conflict on existing email', async () => {
    fakeAuth.getUserByEmail.mockResolvedValueOnce({ uid: 'u' });
    await expect(
      registerUserHandler(makeReq({ ...fullData }))
    ).rejects.toMatchObject({ code: 'already-exists' });
  });

  it('throws conflict on existing phone', async () => {
    fakeAuth.getUserByEmail.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    });
    fakeAuth.getUserByPhoneNumber.mockResolvedValueOnce({ uid: 'u' });
    await expect(
      registerUserHandler(makeReq({ ...fullData }))
    ).rejects.toMatchObject({ code: 'already-exists' });
  });

  it('throws internal if createUser fails', async () => {
    fakeAuth.getUserByEmail.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    });
    fakeAuth.getUserByPhoneNumber.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    });
    fakeAuth.createUser.mockRejectedValueOnce(new Error('fail'));
    await expect(
      registerUserHandler(makeReq({ ...fullData }))
    ).rejects.toMatchObject({ code: 'internal' });
  });

  it('cleans up and internal on post-creation failure', async () => {
    fakeAuth.getUserByEmail.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    });
    fakeAuth.getUserByPhoneNumber.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    });
    fakeAuth.createUser.mockResolvedValueOnce({ uid: 'new-uid' });
    fakeAuth.generateEmailVerificationLink.mockResolvedValueOnce('link');
    sendEmail.mockRejectedValueOnce(new Error('SMTP'));
    await expect(
      registerUserHandler(makeReq({ ...fullData }))
    ).rejects.toMatchObject({ code: 'internal' });
    expect(fakeAuth.deleteUser).toHaveBeenCalledWith('new-uid');
  });

  it('saves user and returns uid on full success', async () => {
    fakeAuth.getUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });
    fakeAuth.getUserByPhoneNumber.mockRejectedValue({
      code: 'auth/user-not-found',
    });
    fakeAuth.createUser.mockResolvedValueOnce({ uid: 'new-uid' });
    fakeAuth.generateEmailVerificationLink.mockResolvedValueOnce('link');
    sendEmail.mockResolvedValueOnce(undefined);
    saveUser.mockResolvedValueOnce(undefined);

    const res = await registerUserHandler(makeReq({ ...fullData }));
    expect(res).toEqual({ uid: 'new-uid' });
    expect(saveUser).toHaveBeenCalled();
  });
});
