
"use server";

import { getUserById } from "@/lib/data";
import type { User } from "@/lib/types";

/**
 * A server-only function to securely fetch user data.
 * This can be called from Server Actions or Route Handlers.
 * @param uid The user's ID
 * @returns The user object or null if not found.
 */
export async function getUser(uid: string): Promise<User | null> {
    try {
        const user = await getUserById(uid);
        return user;
    } catch (error) {
        console.error("Failed to get user:", error);
        return null;
    }
}
