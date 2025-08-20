// src/functions/formsCallable.ts
import { onCall } from 'firebase-functions/v2/https';

// Form core handlers
import { createProjectHandler } from '../../handlers/projects/createProjectHandler';
import { deleteProjectHandler } from '../../handlers/projects/deleteProjectHandler';
import { getProjectByIdHandler } from '../../handlers/projects/getProjectByIdHandler';
import { updateProjectHandler } from '../../handlers/projects/updateProjectHandler';

// Form core
export const createForm = onCall(createProjectHandler);
export const deleteForm = onCall(deleteProjectHandler);
export const getForm = onCall(getProjectByIdHandler);
export const updateForm = onCall(updateProjectHandler);
