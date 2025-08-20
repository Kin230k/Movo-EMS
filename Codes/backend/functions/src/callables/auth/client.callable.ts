// src/functions/client.callable.ts
import { onCall } from 'firebase-functions/v2/https';

// Client
import { createClientHandler } from '../../handlers/auth/client/createClientHandler';
import { approveRejectClientHandler } from '../../handlers/auth/client/approveRejectClientHandler';
import { deleteClientHandler } from '../../handlers/auth/client/deleteClientHandler';
import { getAllClientsHandler } from '../../handlers/auth/client/getAllClientsHandler';
import { getClientByIdHandler } from '../../handlers/auth/client/getClientByIdHandler';
import { updateClientHandler } from '../../handlers/auth/client/updateClientHandler';

// Client core
export const createClient = onCall(createClientHandler);
export const approveRejectClient = onCall(approveRejectClientHandler);
export const deleteClient = onCall(deleteClientHandler);
export const getAllClients = onCall(getAllClientsHandler);
export const getClient = onCall(getClientByIdHandler);
export const updateClient = onCall(updateClientHandler);
