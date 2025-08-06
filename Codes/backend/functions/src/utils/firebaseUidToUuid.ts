import { v5 as uuidv5 } from 'uuid';

// You can define your own namespace UUID (any fixed UUID is fine)
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // example

export function firebaseUidToUuid(uid: string): string {
  return uuidv5(uid, NAMESPACE); // deterministic UUID based on uid
}
