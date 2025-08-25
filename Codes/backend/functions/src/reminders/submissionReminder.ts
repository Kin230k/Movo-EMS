// submissionReminder.ts
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';

if (!admin.apps.length) admin.initializeApp();

export type EmailPayload = {
  displayName?: string;
  status?: 'PASSED' | 'REJECTED' | 'MANUAL_REVIEW';
  details?: string;
  actionLink?: string;
  confirmLink?: string;
};

const REMINDERS_COLLECTION = 'submission_reminders';

/**
 * Create a reminder doc for a submission.
 * Document ID = submissionId (idempotent)
 */
export async function scheduleReminder(
  submissionId: string,
  callerUuid: string,
  email: string,
  delaySeconds = 10 * 60, // default 10 minutes
  emailPayload?: EmailPayload
): Promise<{ success: boolean; reason?: string }> {
  const reminders = admin.firestore().collection(REMINDERS_COLLECTION);
  const docRef = reminders.doc(submissionId);

  const runAt = admin.firestore.Timestamp.fromMillis(
    Date.now() + delaySeconds * 1000
  );

  try {
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data?.status === 'sent') {
        logger.info('Reminder already sent; skipping schedule', {
          submissionId,
        });
        return { success: true, reason: 'already-sent' };
      }
      if (data?.status === 'pending' || data?.status === 'retry') {
        logger.info('Reminder already scheduled; skipping create', {
          submissionId,
        });
        return { success: true, reason: 'already-scheduled' };
      }
    }

    await docRef.set(
      {
        submissionId,
        callerUuid: callerUuid || null,
        email,
        runAt,
        status: 'pending', // pending | processing | sent | retry | failed
        attempts: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastError: null,
        emailPayload: emailPayload || null, // store template inputs here
      },
      { merge: true }
    );

    logger.info('Scheduled reminder in Firestore', {
      submissionId,
      runAt: runAt.toDate().toISOString(),
    });
    return { success: true };
  } catch (err: any) {
    logger.error('Failed to schedule reminder', {
      submissionId,
      err: err?.message || err,
    });
    return { success: false, reason: err?.message || String(err) };
  }
}
