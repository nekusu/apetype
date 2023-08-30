/* eslint-disable @typescript-eslint/unbound-method */
import {
  AuthCredential,
  AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  UserCredential,
  getAuth,
} from 'firebase/auth';
import { IconType } from 'react-icons';
import { RiGithubFill, RiGoogleFill } from 'react-icons/ri';
import { app } from './app';

export const auth = getAuth(app);

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

export {
  EmailAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  unlink,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
