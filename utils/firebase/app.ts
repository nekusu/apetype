import { getApp, getApps, initializeApp } from 'firebase/app';
import config from './config';

export function setupFirebase() {
  return getApps().length ? getApp() : initializeApp(config);
}

export const app = setupFirebase();
