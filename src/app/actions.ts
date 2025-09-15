"use server";

import { prioritizeIssue } from "@/ai/flows/prioritize-reported-issues";

export async function suggestPriority(description: string) {
  if (!description || description.length < 10) {
    return { error: "Please provide a description of at least 10 characters." };
  }
  try {
    const result = await prioritizeIssue({ description });
    return { priority: result.priorityLevel };
  } catch (e) {
    console.error(e);
    return { error: "Failed to get suggestion from AI." };
  }
}
