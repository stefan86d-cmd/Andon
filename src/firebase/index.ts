
'use client';

import { initializeFirebase } from '@/firebase/server-init';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Re-export initializeFirebase for client-side usage if needed,
// but it will pull from the server-init file.
export { initializeFirebase };

// Export all client-side hooks and providers
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

    