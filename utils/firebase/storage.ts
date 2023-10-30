import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { app } from './app';

export const storage = getStorage(app);

export { deleteObject, getDownloadURL, ref, uploadBytes };
