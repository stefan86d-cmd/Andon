
'use server';
/**
 * @fileOverview An AI-powered flow to analyze production issues and generate insights.
 *
 * - analyzeIssues - A function that analyzes a list of issues and returns a summary.
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
  prompt: `You are a production efficiency expert. Your task is to analyze a list of production issues and generate a clear, structured report in markdown format.

Your report must be easy to read and must contain the following sections. Use short paragraphs and ensure there is space between them.

### Overall Summary
Provide a brief, high-level overview of the current situation based on the provided issue list. Keep this section concise.

### Key Observations
In this section, use a bulleted list to highlight important trends, recurring problems, or significant impacts. Focus on patterns related to issue categories, priorities, and production stoppages. Each bullet point should be clear and to the point.

### Actionable Recommendations
Provide a numbered list of clear, concise, and actionable recommendations to address the problems identified in the observations section.

Here is the list of issues for your analysis:
{{#each issues}}
- **{{title}}** (Priority: {{priority}}, Category: {{category}}, Production Stopped: {{productionStopped}})
  Reported: {{reportedAt}}{{#if resolvedAt}}, Resolved: {{resolvedAt}}{{/if}}
{{/each}}

Generate the structured analysis now. Ensure the final output is well-formatted markdown.`,
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
