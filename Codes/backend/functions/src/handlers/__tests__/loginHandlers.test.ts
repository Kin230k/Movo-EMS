import { loginHandler } from '../loginHandlers';
import * as functions from 'firebase-functions/logger';
import userMapper from '../../models/auth/user/user.mapper';
import { User } from '../../models/auth/user/user.class';
import { CallableRequest } from 'firebase-functions/v2/https';

global.fetch = jest.fn() as jest.Mock;

jest.mock('firebase-functions/logger', () => ({
  error: jest.fn()
}));

const mockedLoggerError = functions.error as jest.Mock;
const mockedGetById = userMapper.getById as jest.Mock;

const dummyUser = new User(
  { en: 'Test', ar: 'اختبار' },
  'u@example.com',
  '+123',
  'role',
  'active',
  false,
  undefined,
  'the-uid'
);

const makeRequest = (data: any): CallableRequest<any> => ({
  data,
  auth: undefined,
  rawRequest: {} as any,
  instanceIdToken: '',
} as CallableRequest<any>);

describe('loginHandler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    (global.fetch as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws invalid-argument if email or password missing', async () => {
    await expect(
      loginHandler(makeRequest({ email: '', password: '' }))
    ).rejects.toMatchObject({ code: 'invalid-argument' });

    await expect(
      loginHandler(makeRequest({ email: 'a@b.com' }))
    ).rejects.toMatchObject({ code: 'invalid-argument' });
  });

  it('throws failed-precondition if missing API key', async () => {
    process.env.FIREBASE_API_KEY = '';
    await expect(
      loginHandler(makeRequest({ email: 'u@e.com', password: 'p' }))
    ).rejects.toMatchObject({ code: 'failed-precondition' });
  });

  it('throws internal if fetch errors', async () => {
    process.env.FIREBASE_API_KEY = 'APIKEY';
    (global.fetch as jest.Mock).mockRejectedValue(new Error('net down'));

    await expect(
      loginHandler(makeRequest({ email: 'u@e.com', password: 'p' }))
    ).rejects.toMatchObject({
      code: 'internal',
      message: 'Authentication request failed.',
    });

    expect(mockedLoggerError).toHaveBeenCalled();
  });

  describe('REST errors', () => {
    beforeEach(() => {
      process.env.FIREBASE_API_KEY = 'APIKEY';
    });

    function mockFetchResponse(ok: boolean, body: any) {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok,
        json: () => Promise.resolve(body),
      });
    }

    it('maps EMAIL_NOT_FOUND/INVALID_PASSWORD to unauthenticated', async () => {
      mockFetchResponse(false, { error: { message: 'EMAIL_NOT_FOUND' } });
      await expect(
        loginHandler(makeRequest({ email: 'u@e.com', password: 'p' }))
      ).rejects.toMatchObject({ code: 'unauthenticated' });

      mockFetchResponse(false, { error: { message: 'INVALID_PASSWORD' } });
      await expect(
        loginHandler(makeRequest({ email: 'u@e.com', password: 'wrong' }))
      ).rejects.toMatchObject({ code: 'unauthenticated' });
    });

    it('maps USER_DISABLED to permission-denied', async () => {
      mockFetchResponse(false, { error: { message: 'USER_DISABLED' } });
      await expect(
        loginHandler(makeRequest({ email: 'u@e.com', password: 'p' }))
      ).rejects.toMatchObject({ code: 'permission-denied' });
    });

    it('maps unknown REST error to internal', async () => {
      mockFetchResponse(false, {
        error: { message: 'SOME_OTHER' },
        detail: 'xyz',
      });
      await expect(
        loginHandler(makeRequest({ email: 'u@e.com', password: 'p' }))
      ).rejects.toMatchObject({ code: 'internal' });

      expect(mockedLoggerError).toHaveBeenCalled();
    });
  });

  describe('successful fetch', () => {
    const fakeTokens = {
      idToken: 'ID123',
      refreshToken: 'REF123',
      localId: 'the-uid',
    };

    beforeEach(() => {
      process.env.FIREBASE_API_KEY = 'APIKEY';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fakeTokens),
      });
    });

    it('throws internal on DB-get error', async () => {
      mockedGetById.mockRejectedValueOnce(new Error('DB down'));

      await expect(
        loginHandler(makeRequest({ email: 'u@e.com', password: 'p' }))
      ).rejects.toMatchObject({ code: 'internal' });

      expect(mockedLoggerError).toHaveBeenCalled();
    });

    it('throws not-found if userMapper returns null', async () => {
      mockedGetById.mockResolvedValueOnce(null);

      await expect(
        loginHandler(makeRequest({ email: 'u@e.com', password: 'p' }))
      ).rejects.toMatchObject({ code: 'not-found' });
    });

    it('returns tokens and user on success', async () => {
      mockedGetById.mockResolvedValueOnce(dummyUser);

      const result = await loginHandler(
        makeRequest({ email: 'u@e.com', password: 'p' })
      );

      expect(result).toEqual({
        idToken: fakeTokens.idToken,
        refreshToken: fakeTokens.refreshToken,
        user: dummyUser,
      });
    });
  });
});