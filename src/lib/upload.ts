'use client';

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadVideo = async (
  file: File,
  lessonId: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  const ext = file.name.split('.').pop() || 'mp4';
  const fileName = `lessons/${lessonId}/video_${Date.now()}.${ext}`;
  const storageRef = ref(storage, fileName);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
};