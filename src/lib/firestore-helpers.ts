import { FirebaseError } from "firebase/app";

export function handleFirestoreError(error: unknown) {
    if (error instanceof FirebaseError) {
        return { success: false, error: `Firestore error (${error.code}): ${error.message}` };
    } else if (error instanceof Error) {
        return { success: false, error: `Error: ${error.message}` };
    } else {
        return { success: false, error: "An unexpected error occurred." };
    }
}
