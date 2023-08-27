/* eslint-disable @typescript-eslint/unbound-method */
import { FirebaseOptions, initializeApp } from 'firebase/app';
import {
  AuthCredential,
  AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  UserCredential,
  getAuth,
} from 'firebase/auth';
import { DocumentData, QueryConstraint, getFirestore } from 'firebase/firestore';
import { IconType } from 'react-icons';
import { RiGithubFill, RiGoogleFill } from 'react-icons/ri';

export const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface AuthenticationMethod {
  name: string;
  provider: AuthProvider;
  Icon: IconType;
  credentialFromResult: (userCredential: UserCredential) => AuthCredential | null;
}

export const authenticationMethods: AuthenticationMethod[] = [
  {
    name: 'Google',
    provider: new GoogleAuthProvider(),
    Icon: RiGoogleFill,
    credentialFromResult: GoogleAuthProvider.credentialFromResult,
  },
  {
    name: 'Github',
    provider: new GithubAuthProvider(),
    Icon: RiGithubFill,
    credentialFromResult: GithubAuthProvider.credentialFromResult,
  },
];

export const getDocument = async (path: string, id: string) => {
  const { getDoc, doc } = await import('firebase/firestore');
  return await getDoc(doc(db, path, id));
};
export const getDocuments = async (path: string, ...queryConstraints: QueryConstraint[]) => {
  const { collection, getDocs, query } = await import('firebase/firestore');
  const q = query(collection(db, path), ...queryConstraints);
  return await getDocs(q);
};
export const addDocument = async <T>(path: string, data: T, id?: string) => {
  const { doc, setDoc } = await import('firebase/firestore');
  const docRef = id ? doc(db, path, id) : doc(db, path);
  return await setDoc(docRef, data as DocumentData);
};
export const updateDocument = async <T>(path: string, id: string, data: T) => {
  const { updateDoc, doc } = await import('firebase/firestore');
  return await updateDoc(doc(db, path, id), data as DocumentData);
};
export const deleteDocument = async (path: string, id: string) => {
  const { deleteDoc, doc } = await import('firebase/firestore');
  return await deleteDoc(doc(db, path, id));
};
