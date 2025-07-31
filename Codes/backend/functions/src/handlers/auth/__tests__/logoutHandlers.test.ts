import { logoutHandler } from '../../logoutHandlers';
import * as adminAuth from 'firebase-admin/auth';
import { CallableRequest } from 'firebase-functions/v2/https';

jest.mock('firebase-admin/auth');
jest.mock('firebase-functions/logger', () => ({
  error: jest.fn(),
}));

const revokeRefreshTokensMock = jest.fn();

(adminAuth.getAuth as jest.Mock).mockReturnValue({
  revokeRefreshTokens: revokeRefreshTokensMock,
});

const makeRequest = (uid?: string): CallableRequest<any> =>
  ({
    data: {},
    auth: uid ? { uid } : undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as CallableRequest<any>);

describe('logoutHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws unauthenticated if context.auth missing', async () => {
    await expect(logoutHandler(makeRequest())).rejects.toMatchObject({
      code: 'unauthenticated',
    });
  });

  it('returns success on successful revoke', async () => {
    revokeRefreshTokensMock.mockResolvedValueOnce(undefined);
    const result = await logoutHandler(makeRequest('user-123'));
    expect(result).toEqual({ success: true });
    expect(revokeRefreshTokensMock).toHaveBeenCalledWith('user-123');
  });
});
