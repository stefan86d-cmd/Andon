
'use server';

/**
 * @fileOverview AI-powered issue prioritization for reported issues on the production line.
 *
 * - prioritizeIssue - A function that suggests a priority level for a reported issue.
 * - PrioritizeIssueInput - The input type for the prioritizeIssue function.
 * - PrioritizeIssueOutput - The return type for the prioritizeIssue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeIssueInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the reported issue on the production line.'),
});
export type PrioritizeIssueInput = z.infer<typeof PrioritizeIssueInputSchema>;

const PriorityLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

const PrioritizeIssueOutputSchema = z.object({
  priorityLevel: PriorityLevelSchema.describe(
    'The suggested priority level for the reported issue (low, medium, high, critical).')
});

export type PrioritizeIssueOutput = z.infer<typeof PrioritizeIssueOutputSchema>;

export async function prioritizeIssue(input: PrioritizeIssueInput): Promise<PrioritizeIssueOutput> {
  return prioritizeIssueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeIssuePrompt',
  input: {schema: PrioritizeIssueInputSchema},
  output: {schema: PrioritizeIssueOutputSchema},
  prompt: `You are an AI assistant helping production line supervisors prioritize newly reported issues.

  Based on the issue description provided, suggest a priority level (low, medium, high, or critical).

  Consider the following factors when determining the priority:
  - Potential impact on production line efficiency
  - Severity of the issue
  - Urgency of resolution

  Description: {{{description}}}`,
});

const prioritizeIssueFlow = ai.defineFlow(
  {
    name: 'prioritizeIssueFlow',
    inputSchema: PrioritizeIssueInputSchema,
    outputSchema: PrioritizeIssueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
