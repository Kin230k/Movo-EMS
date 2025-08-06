// src/handlers/auth/__tests__/editUserInfoHandler.test.ts
import { editUserInfoHandler } from '../editUserInfoHandler';
import * as logger from 'firebase-functions/logger';
import { UserService } from '../../../models/auth/user/user.service';
import type { CallableRequest } from 'firebase-functions/v2/https';
import { Multilingual } from '../../../models/multilingual.type';
import { firebaseUidToUuid } from '../../../utils/firebaseUidToUuid';

type Mock = jest.Mock;

// Mocks
jest.mock('firebase-functions/logger', () => ({ error: jest.fn() }));
jest.mock('../../../models/auth/user/user.service');

const mockedLoggerError = logger.error as unknown as Mock;
const mockedEditUserInfo = UserService.editUserInfo as unknown as Mock;

// Helper to build fake request
function makeReq(data: any, uid?: string): CallableRequest<any> {
  return {
    data,
    auth: uid ? { uid } : undefined,
    rawRequest: {} as any,
    instanceIdToken: '',
  } as any;
}

describe('editUserInfoHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns auth issue when not signed in', async () => {
    const res = await editUserInfoHandler(makeReq({}));
    expect(res).toEqual({
      success: false,
      issues: [
        { field: 'auth', message: 'Must be signed in to edit user info' },
      ],
    });
  });

  it('returns validation issue when name missing', async () => {
    const res = await editUserInfoHandler(makeReq({}, 'user-123'));
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'name', message: 'name is required' }],
    });
  });

  it('returns service error when editUserInfo throws', async () => {
    mockedEditUserInfo.mockRejectedValueOnce(new Error('DB error'));
    const validData: any = {
      name: { en: 'Test User' } as Multilingual,
      // picture omitted
    };
    const res = await editUserInfoHandler(makeReq(validData, 'user-123'));
    expect(res).toEqual({
      success: false,
      issues: [{ field: 'service', message: 'DB error' }],
    });
    expect(mockedLoggerError).toHaveBeenCalledWith(
      'Update user info error:',
      expect.any(Error)
    );
  });

  it('returns success and calls service with picture when provided', async () => {
    mockedEditUserInfo.mockResolvedValueOnce({} as any);
    const validData: any = {
      name: { en: 'Test User' } as Multilingual,
      picture: 'https://example.com/avatar.png',
    };
    const res = await editUserInfoHandler(makeReq(validData, 'user-123'));
    expect(res).toEqual({ success: true });
    expect(mockedEditUserInfo).toHaveBeenCalledWith(
      firebaseUidToUuid('user-123'),
      validData.name,
      validData.picture
    );
  });

  it('returns success and calls service with undefined picture when not provided', async () => {
    mockedEditUserInfo.mockResolvedValueOnce({} as any);
    const validData: any = {
      name: { en: 'Test User' } as Multilingual,
    };
    const res = await editUserInfoHandler(makeReq(validData, 'user-123'));
    expect(res).toEqual({ success: true });
    expect(mockedEditUserInfo).toHaveBeenCalledWith(
      firebaseUidToUuid('user-123'),
      validData.name,
      undefined
    );
  });
});
