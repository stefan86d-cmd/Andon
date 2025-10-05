
import { getAdminApp } from './admin';
import { getFirestore } from 'firebase-admin/firestore';

const app = getAdminApp();
const db = getFirestore(app);

export { app, db };
