// src/functions/formsCallable.ts
import { onCall } from 'firebase-functions/v2/https';

// Form core handlers
import { createFormHandler } from '../../handlers/forms/core/createFormHandler';
import { createQuestionsHandler } from '../../handlers/forms/core/createQuestionsHandler';
import { deleteFormHandler } from '../../handlers/forms/core/deleteFormHandler';
import { getFormHandler } from '../../handlers/forms/core/getFormHandler';
import { updateFormHandler } from '../../handlers/forms/core/updateFormHandler';
import { getFormByUserHandler } from '../../handlers/forms/core/getFormsByUserHandler';

// Question handlers
import { createQuestionHandler } from '../../handlers/forms/core/question/createQuestionHandler';
import { deleteQuestionHandler } from '../../handlers/forms/core/question/deleteQuestionHandler';
import { getAllQuestionsHandler } from '../../handlers/forms/core/question/getAllQuestionsHandler';
import { getQuestionHandler } from '../../handlers/forms/core/question/getQuestionHandler';
import { updateQuestionHandler } from '../../handlers/forms/core/question/updateQuestionHandler';
import { getQuestionsByInterviewHandler } from '../../handlers/forms/core/question/getInterviewQuestionsHandler';

// Submission handlers
import { createSubmissionHandler } from '../../handlers/forms/submissions/createSubmissionHandler';
import { deleteSubmissionHandler } from '../../handlers/forms/submissions/deleteSubmissionHandler';
import { getSubmissionHandler } from '../../handlers/forms/submissions/getSubmissionHandler';
import { updateSubmissionHandler } from '../../handlers/forms/submissions/updateSubmissionHandler';
import { getManualSubmissionsByFormIdHandler } from '../../handlers/forms/submissions/getManualSubmissionsByFormHandler';
import { createSubmissionWithAnswerHandler } from '../../handlers/forms/submissions/createSubmissionWithAnswerHandler';
import { createSubmissionWithAnswersHandler } from '../../handlers/forms/submissions/createSubmissionWithAnswersHandler';
import { getManualAnswersBySubmissionIdHandler } from '../../handlers/forms/submissions/getManualAnswersBySubmissionHandler';
import { getSubmissionsByFormHandler } from '../../handlers/forms/submissions/getSubmissionsByFormHandler';
import { getAnswersBySubmissionIdHandler } from '../../handlers/forms/submissions/getAnswersBySubmissionHandler';
import { updateSubmissionStatusHandler } from '../../handlers/forms/submissions/updateSubmissionStatusHandler';
import { getQuestionAnswersBySubmissionIdHandler } from '../../handlers/forms/submissions/getQuestionAnswersBySubmissionHandler';
// Interview handlers
import { createInterviewHandler } from '../../handlers/forms/core/interview/createInterviewHandler';
import { deleteInterviewHandler } from '../../handlers/forms/core/interview/deleteInterviewHandler';
import { getInterviewsByProjectHandler } from '../../handlers/forms/core/interview/getInterviewsByProjectHandler';
import { updateInterviewHandler } from '../../handlers/forms/core/interview/updateInterviewHandler';
import { getInterviewHandler } from '../../handlers/forms/core/interview/getInterviewHandler';

// Export callable functions

// Form core
export const createForm = onCall(createFormHandler);
export const createQuestions = onCall(createQuestionsHandler);
export const deleteForm = onCall(deleteFormHandler);
export const getForm = onCall(getFormHandler);
export const updateForm = onCall(updateFormHandler);
export const getFormByUser=onCall(getFormByUserHandler);
// Question
export const createQuestion = onCall(createQuestionHandler);
export const deleteQuestion = onCall(deleteQuestionHandler);
export const getAllQuestions = onCall(getAllQuestionsHandler);
export const getQuestion = onCall(getQuestionHandler);
export const updateQuestion = onCall(updateQuestionHandler);
export const getInterviewQuestions=onCall(getQuestionsByInterviewHandler);

// Submission
export const createSubmission = onCall(createSubmissionHandler);
export const deleteSubmission = onCall(deleteSubmissionHandler);
export const getSubmission = onCall(getSubmissionHandler);
export const updateSubmission = onCall(updateSubmissionHandler);
export const getManualByFormId = onCall(getManualSubmissionsByFormIdHandler);
export const createSubmissionWithAnswer = onCall(
  createSubmissionWithAnswerHandler
);
export const createSubmissionWithAnswers = onCall(
  createSubmissionWithAnswersHandler
);
export const getManualAnswersBySubmissionId = onCall(
  getManualAnswersBySubmissionIdHandler
);
export const getSubmissionsByForm = onCall(getSubmissionsByFormHandler);
export const getAnswersBySubmissionId = onCall(getAnswersBySubmissionIdHandler);
export const updateSubmissionStatus = onCall(
  updateSubmissionStatusHandler
);
export const getQuestionAnswersBySubmission=onCall(getQuestionAnswersBySubmissionIdHandler);
//Interview
export const createInterview = onCall(createInterviewHandler);
export const updateInterview = onCall(updateInterviewHandler);
export const getInterview = onCall(getInterviewHandler);
export const getInterviewByProject = onCall(getInterviewsByProjectHandler);
export const deleteInterview = onCall(deleteInterviewHandler);
