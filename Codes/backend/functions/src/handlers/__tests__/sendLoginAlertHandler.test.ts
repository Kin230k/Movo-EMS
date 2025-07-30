// src/handlers/__tests__/sendLoginAlertHandler.test.ts

import { sendLoginAlertHandler } from '../sendLoginAlertHandler';
import { getAuth } from 'firebase-admin/auth';

import * as emailService from '../../utils/emailService';

jest.mock('firebase-admin/auth');
jest.mock('../../utils/emailService');

const mockGetAuth = getAuth as unknown as jest.MockedFunction<typeof getAuth>;
const sendEmail = emailService.sendEmail as unknown as jest.Mock;

describe('sendLoginAlertHandler', () => {
  const fakeGetUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuth.mockReturnValue({ getUser: fakeGetUser } as any);
  });

  function makeReq(data: any, auth?: any) {
    return { data, auth } as any;
  }

  it('throws unauthenticated if no auth', async () => {
    await expect(sendLoginAlertHandler(makeReq({}))).rejects.toMatchObject({
      code: 'unauthenticated',
    });
  });

  it('throws failed-precondition if user.email missing', async () => {
    fakeGetUser.mockResolvedValueOnce({
      uid: 'u',
      displayName: 'N',
      email: undefined,
    });
    await expect(
      sendLoginAlertHandler(makeReq({ device: 'X' }, { uid: 'u' }))
    ).rejects.toMatchObject({ code: 'failed-precondition' });
  });

  it('sends with Unknown device when none provided', async () => {
    fakeGetUser.mockResolvedValueOnce({
      uid: 'u',
      displayName: 'User',
      email: 'e@d',
    });
    sendEmail.mockResolvedValueOnce(undefined);

    const res = await sendLoginAlertHandler(makeReq({}, { uid: 'u' }));
    expect(res).toEqual({ success: true });
    expect(sendEmail).toHaveBeenCalledWith('e@d', 'LOGIN_ALERT', [
      'User',
      'Unknown device',
    ]);
  });

  it('sends with provided device', async () => {
    fakeGetUser.mockResolvedValueOnce({
      uid: 'u',
      displayName: 'User',
      email: 'e@d',
    });
    sendEmail.mockResolvedValueOnce(undefined);

    const res = await sendLoginAlertHandler(
      makeReq({ device: 'iPhone' }, { uid: 'u' })
    );
    expect(res).toEqual({ success: true });
    expect(sendEmail).toHaveBeenCalledWith('e@d', 'LOGIN_ALERT', [
      'User',
      'iPhone',
    ]);
  });

  it('wraps unknown errors as internal', async () => {
    fakeGetUser.mockRejectedValueOnce(new Error('boom'));
    await expect(
      sendLoginAlertHandler(makeReq({}, { uid: 'u' }))
    ).rejects.toMatchObject({ code: 'internal' });
  });
});
