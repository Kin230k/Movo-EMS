// src/functions/formsCallable.ts
import { onCall } from 'firebase-functions/v2/https';

// Form core handlers
import { createFormHandler } from '../../handlers/forms/core/createFormHandler';
import { createFormWithQuestionsHandler } from '../../handlers/forms/core/createFormWithQuestionsHandler';
import { deleteFormHandler } from '../../handlers/forms/core/deleteFormHandler';
import { getFormHandler } from '../../handlers/forms/core/getFormHandler';
import { updateFormHandler } from '../../handlers/forms/core/updateFormHandler';

// Question handlers
import { createQuestionHandler } from '../../handlers/forms/core/question/createQuestionHandler';
import { deleteQuestionHandler } from '../../handlers/forms/core/question/deleteQuestionHandler';
import { getAllQuestionsHandler } from '../../handlers/forms/core/question/getAllQuestionsHandler';
import { getQuestionHandler } from '../../handlers/forms/core/question/getQuestionHandler';
import { updateQuestionHandler } from '../../handlers/forms/core/question/updateQuestionHandler';

// Submission handlers
import { createSubmissionHandler } from '../../handlers/forms/submissions/createSubmissionHandler';
import { deleteSubmissionHandler } from '../../handlers/forms/submissions/deleteSubmissionHandler';
import { getSubmissionHandler } from '../../handlers/forms/submissions/getSubmissionHandler';
import { updateSubmissionHandler } from '../../handlers/forms/submissions/updateSubmissionHandler';

// Export callable functions

// Form core
export const createForm = onCall({}, createFormHandler);
export const createFormWithQuestions = onCall(
  {},
  createFormWithQuestionsHandler
);
export const deleteForm = onCall({}, deleteFormHandler);
export const getForm = onCall({}, getFormHandler);
export const updateForm = onCall({}, updateFormHandler);

// Question
export const createQuestion = onCall({}, createQuestionHandler);
export const deleteQuestion = onCall({}, deleteQuestionHandler);
export const getAllQuestions = onCall({}, getAllQuestionsHandler);
export const getQuestion = onCall({}, getQuestionHandler);
export const updateQuestion = onCall({}, updateQuestionHandler);

// Submission
export const createSubmission = onCall({}, createSubmissionHandler);
export const deleteSubmission = onCall({}, deleteSubmissionHandler);
export const getSubmission = onCall({}, getSubmissionHandler);
export const updateSubmission = onCall({}, updateSubmissionHandler);
