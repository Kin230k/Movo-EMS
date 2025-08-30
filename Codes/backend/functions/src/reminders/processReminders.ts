// processReminders.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';

// Import your project-specific send helper.
// Put the correct relative path to your sendSubmissionEmail function.
// Example: if sendSubmissionEmail.ts is in the same src folder use './sendSubmissionEmail'
import { EmailPayload } from './submissionReminder'; // if you stored payload shape there

import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// NOTE: don't call admin.initializeApp() here if services/firebaseAdmin already runs it from index.ts

const REMINDERS_COLLECTION = 'submission_reminders';
const SENT_COLLECTION = 'submission_reminder_sent';
const DEAD_LETTER_COLLECTION = 'submission_reminder_dlq';

const MAX_BATCH = 50;
const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_SECONDS = 60 * 60; // 1 hour

function computeBackoffSeconds(attempts: number) {
  return BASE_BACKOFF_SECONDS * Math.pow(2, Math.max(0, attempts - 1));
}

export const processDueReminders = onSchedule('every 1 hours', async (ctx) => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const remindersRef = db.collection(REMINDERS_COLLECTION);

  const query = remindersRef.where('runAt', '<=', now).limit(MAX_BATCH);
  const snap = await query.get();
  if (snap.empty) {
    logger.debug('No due reminders this run');
    return;
  }

  const jobs: Promise<any>[] = [];
  for (const doc of snap.docs) {
    jobs.push(processReminderDoc(doc.id, doc.ref));
  }

  await Promise.allSettled(jobs);
  logger.info('processDueReminders run complete', { processed: snap.size });
});

async function processReminderDoc(
  docId: string,
  docRef: admin.firestore.DocumentReference
) {
  const db = admin.firestore();

  try {
    const claimedData = await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists) return null;
      const data = snap.data() as any;
      if (!data) return null;

      const status = data.status;
      if (status === 'processing' || status === 'sent') return null;

      const runAt: Timestamp = data.runAt;
      if (runAt.toMillis() > Date.now()) return null;

      const newAttempts = (data.attempts || 0) + 1;
      tx.update(docRef, {
        status: 'processing',
        attempts: newAttempts,
        lastClaimedAt: FieldValue.serverTimestamp(),
      });
      return { ...data, attempts: newAttempts };
    });

    if (!claimedData) {
      logger.debug('Doc not claimed (another worker or not due)', { docId });
      return;
    }

    try {
      const to: string = claimedData.email;
      const submissionId: string = claimedData.submissionId;
      const payload: EmailPayload = claimedData.emailPayload || {};

      const displayName = payload.displayName || 'User';
      const status =
        (payload.status as 'PASSED' | 'REJECTED' | 'MANUAL_REVIEW') ||
        'MANUAL_REVIEW';
      const details = payload.details;
      const actionLink = payload.actionLink;
      const confirmLink = payload.confirmLink;

      // Use your send helper
      await sendSubmissionEmail(
        to,
        displayName,
        status,
        details,
        actionLink,
        confirmLink
      );

      // mark as sent and store sent record (idempotent by submissionId)
      const sentRef = db.collection(SENT_COLLECTION).doc(submissionId);
      await sentRef.set({
        submissionId,
        email: to,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        originalReminderRef: docRef.path,
      });

      await docRef.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        lastError: null,
      });

      logger.info('Reminder sent via sendSubmissionEmail', {
        docId,
        submissionId,
        to,
      });
    } catch (sendErr: any) {
      logger.warn('Error sending reminder; scheduling retry or DLQ', {
        docId,
        err: sendErr?.message || sendErr,
      });

      const attempts = claimedData.attempts || 1;
      if (attempts >= MAX_ATTEMPTS) {
        const dlqRef = db.collection(DEAD_LETTER_COLLECTION).doc(docId);
        const snap = await docRef.get();
        await dlqRef.set({
          ...snap.data(),
          movedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastError: sendErr?.message || String(sendErr),
        });
        await docRef.update({
          status: 'failed',
          lastError: sendErr?.message || String(sendErr),
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger.error('Reminder moved to DLQ after max attempts', {
          docId,
          attempts,
        });
      } else {
        const backoffSeconds = computeBackoffSeconds(attempts);
        const nextRunAt = admin.firestore.Timestamp.fromMillis(
          Date.now() + backoffSeconds * 1000
        );
        await docRef.update({
          status: 'retry',
          runAt: nextRunAt,
          lastError: sendErr?.message || String(sendErr),
          lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger.info('Reminder scheduled for retry', {
          docId,
          attempts,
          nextRunAt: nextRunAt.toDate().toISOString(),
        });
      }
    }
  } catch (err: any) {
    logger.error('Unexpected error processing reminder', {
      docId,
      err: err?.message || err,
    });
  }
}
