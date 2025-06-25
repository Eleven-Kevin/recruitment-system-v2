'use server';

/**
 * @fileOverview Implements an AI flow that recommends jobs to students based on their skills, GPA, and past applications.
 *
 * - recommendJobs - A function that recommends jobs to students.
 * - RecommendJobsInput - The input type for the recommendJobs function.
 * - RecommendJobsOutput - The return type for the recommendJobs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendJobsInputSchema = z.object({
  studentSkills: z.array(z.string()).describe('List of skills possessed by the student.'),
  studentGPA: z.number().min(0).max(10).describe('The GPA of the student (0-10 scale).'),
  pastApplications: z.array(z.string()).describe('List of job IDs the student has applied to in the past.'),
  allJobs: z.array(z.object({
    jobId: z.string().describe('The unique identifier for the job.'),
    jobTitle: z.string().describe('The title of the job.'),
    jobDescription: z.string().describe('The description of the job.'),
    requiredSkills: z.array(z.string()).describe('List of skills required for the job.'),
    requiredGPA: z.number().min(0).max(10).describe('The minimum GPA required for the job (0-10 scale).'),
  })).describe('A list of all available jobs.'),
});
export type RecommendJobsInput = z.infer<typeof RecommendJobsInputSchema>;

const RecommendJobsOutputSchema = z.array(z.object({
  jobId: z.string().describe('The unique identifier for the recommended job.'),
  relevanceScore: z.number().describe('A score indicating the relevance of the job to the student (0-1).'),
})).describe('A list of recommended jobs, sorted by relevance score in descending order.');
export type RecommendJobsOutput = z.infer<typeof RecommendJobsOutputSchema>;

export async function recommendJobs(input: RecommendJobsInput): Promise<RecommendJobsOutput> {
  return recommendJobsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendJobsPrompt',
  input: {schema: RecommendJobsInputSchema},
  output: {schema: RecommendJobsOutputSchema},
  prompt: `You are an AI job recommendation system. You will be provided with a student's skills, GPA (on a 0-10 scale), past applications, and a list of all available jobs. Your task is to recommend the jobs that are most relevant to the student.

Student Skills: {{{studentSkills}}}
Student GPA (0-10 scale): {{{studentGPA}}}
Past Applications: {{{pastApplications}}}

All Jobs:
{{#each allJobs}}
Job ID: {{{jobId}}}
Job Title: {{{jobTitle}}}
Job Description: {{{jobDescription}}}
Required Skills: {{{requiredSkills}}}
Required GPA (0-10 scale): {{{requiredGPA}}}
{{/each}}

For each job, consider the student's skills, GPA, and past applications to determine its relevance. A higher GPA (on the 0-10 scale) and a greater overlap between the student's skills and the job's required skills should result in a higher relevance score. Also, consider that the student might not want to see jobs that they already applied to. 

Output a list of recommended jobs, sorted by relevance score in descending order. Each job should include the job ID and a relevance score between 0 and 1.

Ensure that the output follows the specified JSON schema.`,  
});

const recommendJobsFlow = ai.defineFlow(
  {
    name: 'recommendJobsFlow',
    inputSchema: RecommendJobsInputSchema,
    outputSchema: RecommendJobsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);