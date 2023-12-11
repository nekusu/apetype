import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  PartialWithFieldValue,
  QueryConstraint,
  SetOptions,
  UpdateData,
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
