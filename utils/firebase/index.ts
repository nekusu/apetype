export async function getFirebaseAuth() {
  return await import('utils/firebase/auth');
}

export async function getFirebaseFirestore() {
  return await import('utils/firebase/firestore');
}

export async function getFirebaseStorage() {
  return await import('utils/firebase/storage');
}
