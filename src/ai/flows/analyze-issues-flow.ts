
'use server';
/**
 * @fileOverview An AI-powered flow to analyze production issues and generate insights.
 *
 * - analyzeIssues - A function that analyzes a list of issues and returns a summary.
 * - AnalyzeIssuesInput - The input type for the analyzeIssues function.
 * - AnalyzeIssuesOutput - The return type for the analyzeIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IssueForAnalysisSchema = z.object({
  title: z.string(),
  category: z.string(),
  priority: z.string(),
  productionStopped: z.boolean(),
  reportedAt: z.string(),
  resolvedAt: z.string().optional(),
});

const AnalyzeIssuesInputSchema = z.object({
  issues: z.array(IssueForAnalysisSchema).describe('A list of issues to be analyzed.'),
});
type AnalyzeIssuesInput = z.infer<typeof AnalyzeIssuesInputSchema>;

const AnalyzeIssuesOutputSchema = z.object({
  analysis: z.string().describe('A concise, insightful analysis of the provided production issues. Use markdown for formatting, including headers, lists, and bold text.'),
});
type AnalyzeIssuesOutput = z.infer<typeof AnalyzeIssuesOutputSchema>;


export async function analyzeIssues(input: AnalyzeIssuesInput): Promise<AnalyzeIssuesOutput> {
    return analyzeIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeIssuesPrompt',
  input: {schema: AnalyzeIssuesInputSchema},
  output: {schema: AnalyzeIssuesOutputSchema},
  prompt: `You are a production efficiency expert. Analyze the following list of production issues and provide a concise analysis in markdown format.

Your analysis should include:
- A brief overall summary of the situation.
- Key observations, highlighting any trends, recurring problems, or significant impacts (like production stoppages).
- Actionable recommendations to address the identified problems.

Here is the list of issues to analyze:
{{#each issues}}
- **{{title}}** (Priority: {{priority}}, Category: {{category}}, Production Stopped: {{productionStopped}})
  Reported: {{reportedAt}}{{#if resolvedAt}}, Resolved: {{resolvedAt}}{{/if}}
{{/each}}

Generate the analysis now.`,
});

const analyzeIssuesFlow = ai.defineFlow(
  {
    name: 'analyzeIssuesFlow',
    inputSchema: AnalyzeIssuesInputSchema,
    outputSchema: AnalyzeIssuesOutputSchema,
  },
  async input => {
    if (input.issues.length === 0) {
        return { analysis: 'There are no issues to analyze in the selected period. Try expanding your date range or changing your filters.' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
