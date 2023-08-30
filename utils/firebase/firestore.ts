import {
  DocumentData,
  QueryConstraint,
  and,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  or,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { app } from './app';

export const db = getFirestore(app);

export const getDocument = async (path: string, id: string) => {
  return await getDoc(doc(db, path, id));
};
export const getDocuments = async (path: string, ...queryConstraints: QueryConstraint[]) => {
  const q = query(collection(db, path), ...queryConstraints);
  return await getDocs(q);
};
export const addDocument = async <T>(path: string, data: T, id?: string) => {
  const docRef = id ? doc(db, path, id) : doc(db, path);
  return await setDoc(docRef, data as DocumentData);
};
export const updateDocument = async <T>(path: string, id: string, data: T) => {
  return await updateDoc(doc(db, path, id), data as DocumentData);
};
export const deleteDocument = async (path: string, id: string) => {
  return await deleteDoc(doc(db, path, id));
};

export {
  and,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  or,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
};
