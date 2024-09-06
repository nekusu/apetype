import {
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type PartialWithFieldValue,
  type Query,
  type QueryConstraint,
  type SetOptions,
  type UpdateData,
  addDoc,
  and,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  or,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { app } from './app';

export const db = getFirestore(app);

export const getDocument = async <T>(path: string, id: string) => {
  const documentRef = doc(db, path, id) as DocumentReference<T>;
  return await getDoc(documentRef);
};
export const getDocuments = async <T>(path: string, ...queryConstraints: QueryConstraint[]) => {
  const collectionRef = collection(db, path) as CollectionReference<T>;
  const q = query(collectionRef, ...queryConstraints);
  return await getDocs(q);
};
export const addDocument = async <T>(path: string, data: T) => {
  const collectionRef = collection(db, path) as CollectionReference<T>;
  return await addDoc(collectionRef, data);
};
export const setDocument = async <T>(
  path: string,
  id: string,
  data: PartialWithFieldValue<T>,
  options: SetOptions = {},
) => {
  const documentRef = doc(db, path, id) as DocumentReference<T>;
  return await setDoc(documentRef, data, options);
};
export const updateDocument = async <T>(path: string, id: string, data: UpdateData<T>) => {
  const documentRef = doc(db, path, id) as DocumentReference<T>;
  return await updateDoc(documentRef, data as UpdateData<DocumentData>);
};
export const deleteDocument = async (path: string, id: string) => {
  return await deleteDoc(doc(db, path, id));
};
async function deleteQueryBatch(q: Query, batchSize: number, resolve: (value?: unknown) => void) {
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    resolve();
    return;
  }

  const batch = writeBatch(db);
  for (const doc of querySnapshot.docs) batch.delete(doc.ref);
  await batch.commit();

  if (querySnapshot.size < batchSize) {
    resolve();
    return;
  }

  setTimeout(() => {
    deleteQueryBatch(q, batchSize, resolve);
  }, 0);
}
export async function deleteCollection(path: string, batchSize: number) {
  const collectionRef = collection(db, path);
  const q = query(collectionRef, limit(batchSize));

  return new Promise((resolve) => {
    deleteQueryBatch(q, batchSize, resolve);
  });
}

export {
  addDoc,
  and,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  or,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
};
