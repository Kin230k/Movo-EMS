import { onRequest } from 'firebase-functions/v2/https';
import data from '../functionMetadata.json';
export const getFunctions = onRequest({}, (req, res) => {
  res.json(data);
});
