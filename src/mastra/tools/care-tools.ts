import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { getCareGuide, getSeasonalTasks } from '../lib/knowledge-base.ts'

export const careGuideTool = createTool({
  id: 'get-care-guide',
  description:
    'Fetch best-practice care guidance (watering, sunlight, soil, fertilizing, common mistakes) for a specific plant. Use when the user asks how to care for or prevent problems in a plant.',
  inputSchema: z.object({
    plant: z.string().describe('Plant or crop name, e.g. "tomato", "basil", "rose"'),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    guide: z
      .object({
        plant: z.string(),
        category: z.string(),
        watering: z.string(),
        sunlight: z.string(),
        soil: z.string(),
        fertilizing: z.string(),
        commonMistakes: z.array(z.string()),
      })
      .optional(),
    message: z.string(),
  }),
  execute: async ({ plant }) => {
    const guide = getCareGuide(plant)
    if (!guide) {
      return {
        found: false,
        message: `No care guide found for "${plant}". Provide general advice and say the specific guide is unavailable.`,
      }
    }
    return { found: true, guide, message: 'Guide found.' }
  },
})

export const seasonalGuideTool = createTool({
  id: 'get-seasonal-tasks',
  description:
    'Fetch season-appropriate gardening or farming tasks for a region. Use for questions about what to do now, seasonal preparation, or timing.',
  inputSchema: z.object({
    season: z.enum(['spring', 'summer', 'autumn', 'winter']),
    region: z.enum(['tropical', 'temperate', 'arid', 'general']).default('general'),
  }),
  outputSchema: z.object({
    tasks: z.array(z.string()),
    season: z.string(),
    region: z.string(),
  }),
  execute: async ({ season, region }) => {
    const lists = getSeasonalTasks(season, region)
    return {
      tasks: lists.flatMap(l => l.tasks),
      season,
      region,
    }
  },
})
