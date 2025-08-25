// src/functions/admin.callable.ts
import { onCall } from 'firebase-functions/v2/https';

// Admin core handlers
import { createAdminHandler } from '../../handlers/auth/admin/createAdminHandler';
import { getAdminByIdHandler } from '../../handlers/auth/admin/getAdminByIdHandler';
import { getAllAdminsHandler } from '../../handlers/auth/admin/getAllAdminsHandler';
import { updateAdminHandler } from '../../handlers/auth/admin/updateAdminHandler';

// Admin core
export const createAdmin = onCall(createAdminHandler);
export const getAdmin = onCall(getAdminByIdHandler);
export const getAllAdmins = onCall(getAllAdminsHandler);
export const updateAdmin = onCall(updateAdminHandler);
