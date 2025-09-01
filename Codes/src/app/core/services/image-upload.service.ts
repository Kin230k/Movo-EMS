import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
} from 'firebase/storage';

export interface UploadProgress {
  progress: number; // 0..100
  downloadURL?: string; // present when upload completes
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  /**
   * Uploads a File to Firebase Storage (default app).
   * @param file the File to upload
   * @param path optional destination path (e.g. 'profiles/uid_filename.jpg'). If omitted one will be generated.
   * @returns Observable that emits progress updates and finally emits downloadURL then completes.
   *           Unsubscribe to cancel the upload (the upload task will be canceled).
   */
  uploadFile(file: File, path?: string): Observable<UploadProgress> {
    const storage = getStorage();
    const filename = file.name.replace(/\s+/g, '_');
    const destPath = path ?? `uploads/${Date.now()}_${filename}`;
    const storageRef = ref(storage, destPath);
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    return new Observable<UploadProgress>((observer) => {
      const unsubscribe = uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          observer.next({ progress });
        },
        (error) => {
          observer.error(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            observer.next({ progress: 100, downloadURL });
            observer.complete();
          } catch (err) {
            observer.error(err);
          }
        }
      );

      // teardown: if the consumer unsubscribes, cancel the upload
      return () => {
        try {
          uploadTask.cancel();
        } catch {
          /* ignore */
        }
        // uploadTask.on returns nothing in modular sdk; `unsubscribe` is placeholder
      };
    });
  }
}
