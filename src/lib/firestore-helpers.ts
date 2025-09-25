
import { errorEmitter, FirestorePermissionError, type SecurityRuleContext } from '@/firebase';

/**
 * A centralized error handler for Firestore write operations.
 * It creates a detailed permission error and emits it globally.
 * This function is intended to be used in the `.catch()` block of a Firestore promise.
 * 
 * @param serverError The raw error thrown by the Firestore SDK.
 * @param context The operational context (path, operation type, data) for creating a detailed error.
 */
export function handleFirestoreError(serverError: any, context: SecurityRuleContext) {
  // Create the rich, contextual error.
  const permissionError = new FirestorePermissionError(context);

  // Emit the error using the global error emitter.
  // This avoids using console.error and allows a centralized listener to handle it.
  errorEmitter.emit('permission-error', permissionError);
}

    