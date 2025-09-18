"use server";

import { revalidatePath } from 'next/cache';
import { prioritizeIssue } from "@/ai/flows/prioritize-reported-issues";
import { addIssue } from "@/lib/data";
import type { Issue } from "@/lib/types";

export async function suggestPriority(description: string) {
  if (!description) {
    return { error: "Please provide a description." };
  }
  try {
    const result = await prioritizeIssue({ description });
    return { priority: result.priorityLevel };
  } catch (e) {
    console.error(e);
    return { error: "Failed to get suggestion from AI." };
  }
}

export async function reportIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'reportedBy' | 'status'>) {
    try {
        addIssue(issueData);
        revalidatePath('/dashboard');
        revalidatePath('/issues');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to report issue." };
    }
}
