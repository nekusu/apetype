import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import config from './config';

export function setupFirebaseAdmin() {
  return getApps().length ? getApp() : initializeApp(config);
}
