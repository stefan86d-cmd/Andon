
import { FirebaseError } from "firebase/app";

export function handleFirestoreError(error: unknown) {
    if (error instanceof FirebaseError) {
        console.error(`Firestore Error (${error.code}):`, error.message);
        return { success: false, error: `A database error occurred: ${error.message}` };
    } else {
        console.error("An unexpected error occurred:", error);
        return { success: false, error: "An unexpected error occurred. Please try again." };
    }
}
