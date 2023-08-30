import { getApp, getApps, initializeApp } from 'firebase/app';
import config from './config';

const setupFirebase = () => {
  if (getApps.length) return getApp();
  return initializeApp(config);
};

export const app = setupFirebase();
