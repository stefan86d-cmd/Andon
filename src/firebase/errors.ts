
// NOTE: This file is used by both client and server, so it cannot contain
// any browser-specific APIs or 'use client' directives.

// This type is shared between client and server.
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

// A simplified auth object for the error message, not relying on live auth state.
interface SimpleAuthObject {
  uid?: string;
  [key: string]: any;
}

interface SecurityRuleRequest {
  auth: SimpleAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Builds a simplified request object for the error message.
 * It does not attempt to get the live authenticated user.
 * @param context The context of the failed Firestore operation.
 * @returns A structured request object.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  return {
    // Auth is kept generic; rules will ultimately use the real request.auth
    auth: { uid: 'uid_placeholder' },
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData
      ? { data: context.requestResourceData }
      : undefined,
  };
}

/**
 * Builds the final, formatted error message.
 * @param requestObject The simulated request object.
 * @returns A string containing the error message and the JSON payload.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  try {
    return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
  } catch (e) {
    // Fallback in case of circular structure in requestResourceData
    return 'Missing or insufficient permissions. Could not stringify the request object for details.';
  }
}

/**
 * A custom error class designed to be consumed by an LLM for debugging.
 * It structures the error information to mimic the request object
 * available in Firestore Security Rules, but is safe to run on the server.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(buildErrorMessage(requestObject));
    this.name = 'FirebaseError';
    this.request = requestObject;
  }
}
