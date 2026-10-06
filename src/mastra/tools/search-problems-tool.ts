import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { searchProblems } from '../lib/knowledge-base.ts'

export const searchProblemsTool = createTool({
  id: 'search-plant-problems',
  description:
    'Search the curated agricultural knowledge base for plant diseases, pests, nutrient deficiencies, and environmental problems. Always call this before giving a diagnosis. Input free-text symptoms and plant name; returns ranked matching problems with symptoms, causes, treatment, and prevention.',
  inputSchema: z.object({
    query: z
      .string()
      .describe('Free-text description: plant name plus observed symptoms, e.g. "tomato yellow lower leaves powdery white spots"'),
    limit: z.number().int().min(1).max(5).default(3).describe('Number of ranked matches to return'),
  }),
  outputSchema: z.object({
    matches: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        category: z.string(),
        affectedPlants: z.array(z.string()),
        symptoms: z.array(z.string()),
        likelyCauses: z.array(z.string()),
        treatment: z.array(z.string()),
        prevention: z.array(z.string()),
        severity: z.string(),
        urgencyNote: z.string().optional(),
      }),
    ),
    matchCount: z.number(),
  }),
  execute: async ({ query, limit }) => {
    const matches = searchProblems(query, limit)
    return {
      matches: matches.map(m => ({
        id: m.id,
        title: m.title,
        category: m.category,
        affectedPlants: m.affectedPlants,
        symptoms: m.symptoms,
        likelyCauses: m.likelyCauses,
        treatment: m.treatment,
        prevention: m.prevention,
        severity: m.severity,
        urgencyNote: m.urgencyNote,
      })),
      matchCount: matches.length,
    }
  },
})
