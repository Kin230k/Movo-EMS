// src/functions/projectUserRole.callable.ts
import { onCall } from 'firebase-functions/v2/https';

// Project User Role Handlers
import { createProjectUserRoleHandler } from '../../handlers/auth/project_user_role/createProjectUserRoleHandler';
import { updateProjectUserRoleByUserAndProjectHandler } from '../../handlers/auth/project_user_role/updateProjectUserRoleByUserAndProjectHandler';
import { deleteProjectUserRoleHandler } from '../../handlers/auth/project_user_role/deleteProjectUserRoleHandler';
import { getProjectUserRoleHandler } from '../../handlers/auth/project_user_role/getProjectUserRoleHandler';
import { getAllProjectUserRolesHandler } from '../../handlers/auth/project_user_role/getAllProjectUserRolesHandler';
import { getProjectUserRolesByUserAndProjectHandler } from '../../handlers/auth/project_user_role/getProjectUserRolesByUserAndProjectHandler';
import { deleteProjectUserRolesByUserAndProjectHandler } from '../../handlers/auth/project_user_role/deleteProjectUserRolesByUserAndProjectHandler';
// Project User Role Callables
export const createProjectUserRole = onCall(createProjectUserRoleHandler);
export const updateProjectUserRoleByUserAndProject = onCall(updateProjectUserRoleByUserAndProjectHandler);
export const deleteProjectUserRole = onCall(deleteProjectUserRoleHandler);
export const getProjectUserRole = onCall(getProjectUserRoleHandler);
export const getAllProjectUserRoles = onCall(getAllProjectUserRolesHandler);
export const getProjectUserRolesByUserAndProject = onCall(getProjectUserRolesByUserAndProjectHandler);
export const deleteProjectUserRolesByUserAndProject=onCall(deleteProjectUserRolesByUserAndProjectHandler);