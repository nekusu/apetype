import {
  type AuthCredential,
  type AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  type UserCredential,
  getAuth,
} from 'firebase/auth';
import type { IconType } from 'react-icons';
import { RiGithubFill, RiGoogleFill } from 'react-icons/ri';
import { app } from './app';

export const auth = getAuth(app);

export interface AuthenticationMethod {
  name: string;
  provider: AuthProvider;
  icon: IconType;
  credentialFromResult: (userCredential: UserCredential) => AuthCredential | null;
}

export const authenticationMethods: AuthenticationMethod[] = [
  {
    name: 'Google',
    provider: new GoogleAuthProvider(),
    icon: RiGoogleFill,
    credentialFromResult: GoogleAuthProvider.credentialFromResult,
  },
  {
    name: 'Github',
    provider: new GithubAuthProvider(),
    icon: RiGithubFill,
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
