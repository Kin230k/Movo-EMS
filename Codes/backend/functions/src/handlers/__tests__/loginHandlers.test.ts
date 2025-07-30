// src/handlers/__tests__/loginHandlers.test.ts

import { loginHandler, LoginResult } from '../loginHandlers';
import userMapper from '../../models/auth/user/user.mapper';
import { HttpsError } from 'firebase-functions/v2/https';

jest.mock('../../models/auth/user/user.mapper');

const mockedGetById = userMapper.getById as unknown as jest.Mock;

// A minimal fetch-mock
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('loginHandler', () => {
  const OLD_API_KEY = process.env.FIREBASE_API_KEY;
  beforeAll(() => {
    process.env.FIREBASE_API_KEY = 'test-api-key';
  });
  afterAll(() => {
    process.env.FIREBASE_API_KEY = OLD_API_KEY;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeReq(data: any) {
    return { data } as any;
  }

  it('throws invalid-argument if email or password missing', async () => {
    await expect(
      loginHandler(makeReq({ email: '', password: '' }))
    ).rejects.toThrow(HttpsError);
  });

  it('throws failed-precondition if API key missing', async () => {
    delete process.env.FIREBASE_API_KEY;
    await expect(
      loginHandler(makeReq({ email: 'a@b.com', password: 'p' }))
    ).rejects.toMatchObject({ code: 'failed-precondition' });
    process.env.FIREBASE_API_KEY = 'test-api-key';
  });

  it('propagates HttpsError on bad credentials', async () => {
    const body = { error: { message: 'INVALID_PASSWORD' } };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => body,
    });
    await expect(
      loginHandler(makeReq({ email: 'u@e.com', password: 'bad' }))
    ).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  it('throws internal if fetch itself errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    await expect(
      loginHandler(makeReq({ email: 'u@e.com', password: 'p' }))
    ).rejects.toMatchObject({ code: 'internal' });
  });

  it('throws internal on userMapper.getById rejection', async () => {
    // first simulate good fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        idToken: 'ID',
        refreshToken: 'REF',
        localId: 'UID',
      }),
    });
    mockedGetById.mockRejectedValueOnce(new Error('db down'));

    await expect(
      loginHandler(makeReq({ email: 'u@e.com', password: 'p' }))
    ).rejects.toMatchObject({ code: 'internal' });
  });

  it('throws not-found if no user profile', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        idToken: 'ID',
        refreshToken: 'REF',
        localId: 'UID',
      }),
    });
    mockedGetById.mockResolvedValueOnce(null);

    await expect(
      loginHandler(makeReq({ email: 'u@e.com', password: 'p' }))
    ).rejects.toMatchObject({ code: 'not-found' });
  });

  it('returns tokens and user on success', async () => {
    const fakeUser = { uid: 'UID', email: 'u@e.com' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        idToken: 'ID',
        refreshToken: 'REF',
        localId: 'UID',
      }),
    });
    mockedGetById.mockResolvedValueOnce(fakeUser);

    const res = (await loginHandler(
      makeReq({ email: 'u@e.com', password: 'p' })
    )) as LoginResult;

    expect(res.idToken).toBe('ID');
    expect(res.refreshToken).toBe('REF');
    expect(res.user).toEqual(fakeUser);
  });
});
