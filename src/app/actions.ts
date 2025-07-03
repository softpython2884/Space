'use server';

import { getUpgradeAdvice, UpgradeAdviceInput, UpgradeAdviceOutput } from '@/ai/flows/upgrade-advisor';
import { z } from 'zod';

const UpgradeAdviceInputSchema = z.object({
  resources: z.object({
    money: z.number(),
    ore: z.number(),
    gas: z.number(),
  }),
  ship: z.object({
      class: z.any(),
      role: z.any(),
      size: z.any(),
      upgrades: z.record(z.string(), z.number()),
  }),
  level: z.number(),
});

export async function getUpgradeAdviceAction(
  data: UpgradeAdviceInput
): Promise<{ advice: UpgradeAdviceOutput | null; error: string | null }> {
  
  const parsed = UpgradeAdviceInputSchema.safeParse(data);

  if (!parsed.success) {
    return { advice: null, 'error': parsed.error.flatten().fieldErrors.toString() };
  }

  try {
    const advice = await getUpgradeAdvice(parsed.data);
    return { advice, error: null };
  } catch (e) {
    console.error(e);
    return { advice: null, error: 'An error occurred while fetching AI-powered advice. Please try again later.' };
  }
}
