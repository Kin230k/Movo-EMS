// src/handlers/auth/__tests__/getUserInfoHandler.test.ts
import { getUserInfoHandler } from '../getUserInfoHandler';
import { CallableRequest } from 'firebase-functions/v2/https';
import { UserService } from '../../../models/auth/user/user.service';
import { parseDbError } from '../../../utils/dbErrorParser';
import { User } from '../../../models/auth/user/user.class';
import { UserStatus } from '../../../models/auth/user/user_status.enum';
import { Operation } from '../../../models/operation.enum';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';

jest.mock('../../../models/auth/user/user.service');
jest.mock('../../../utils/dbErrorParser');

type MockReq = CallableRequest<any>;
function makeReq(authUid?: string): MockReq {
  return {
    data: {}, // handler ignores request.data entirely
    auth: authUid ? { uid: authUid } : undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as MockReq;
}

describe('getUserInfoHandler', () => {
  const mockGetById = UserService.getUserById as jest.Mock;
  const mockParseDbError = parseDbError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fails if not signed in', async () => {
    const res = await getUserInfoHandler(makeReq());
    expect(res).toEqual({
      success: false,
      issues: [
        { field: 'auth', message: 'Must be signed in to get user info' },
      ],
    });
  });

  it('fetches user by auth.uid and returns success', async () => {
    const fakeUser = new User(
      { en: 'Test', ar: 'تست' },
      'e@e.com',
      '+100',
      'role',
      UserStatus.Active,
      false,
      undefined,
      Operation.UPDATE,
      'authUid'
    );
    mockGetById.mockResolvedValueOnce(fakeUser);

    const res = await getUserInfoHandler(makeReq('authUid'));
    expect(UserService.getUserById).toHaveBeenCalledWith(
      firebaseUidToUuid('authUid')
    );
    expect(res).toEqual({ success: true, user: fakeUser });
  });

  it('returns issue if user not found', async () => {
    mockGetById.mockResolvedValueOnce(null);

    const res = await getUserInfoHandler(makeReq('authUid'));
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'uid', message: 'User not found' }],
    });
  });

  it('returns parsed DB errors on fetch failure', async () => {
    const dbErr = new Error('DB down');
    mockGetById.mockRejectedValueOnce(dbErr);
    mockParseDbError.mockReturnValueOnce([{ field: 'db', message: 'parsed' }]);

    const res = await getUserInfoHandler(makeReq('authUid'));
    expect(parseDbError).toHaveBeenCalledWith(dbErr);
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'db', message: 'parsed' }],
    });
  });

  it('fails if user is inactive', async () => {
    const fakeUser = new User(
      { en: 'Inactive', ar: 'غير نشط' },
      'nope@e.com',
      '+300',
      'role',
      UserStatus.Inactive,
      false,
      undefined,
      Operation.UPDATE,
      'uid123'
    );
    mockGetById.mockResolvedValueOnce(fakeUser);

    const res = await getUserInfoHandler(makeReq('uid123'));
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'status', message: 'User is not active' }],
    });
  });
});
