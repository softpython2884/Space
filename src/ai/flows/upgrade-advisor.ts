'use server';

/**
 * @fileOverview Provides AI-driven upgrade advice for spaceship enhancements.
 *
 * - getUpgradeAdvice - Analyzes player resources, ship type, and level to suggest optimal upgrades.
 * - UpgradeAdviceInput - The input type for the getUpgradeAdvice function.
 * - UpgradeAdviceOutput - The return type for the getUpgradeAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpgradeAdviceInputSchema = z.object({
  resources: z.object({
    money: z.number().describe('The amount of money the player has.'),
    ore: z.number().describe('The amount of ore the player has.'),
    gas: z.number().describe('The amount of gas the player has.'),
  }).describe('The player current resources'),
  shipType: z.enum(['Combat', 'Mining', 'Support', 'Galleon']).describe('The type of spaceship the player is using.'),
  level: z.number().describe('The current level of the player.'),
  currentUpgrades: z.record(z.string(), z.number()).optional().describe('A list of the players current upgrades and their levels')
});
export type UpgradeAdviceInput = z.infer<typeof UpgradeAdviceInputSchema>;

const UpgradeAdviceOutputSchema = z.object({
  suggestedUpgrades: z.array(
    z.object({
      upgradeName: z.string().describe('The name of the upgrade.'),
      reasoning: z.string().describe('The reasoning behind suggesting this upgrade.'),
    })
  ).describe('A list of suggested upgrades and their reasoning.'),
});
export type UpgradeAdviceOutput = z.infer<typeof UpgradeAdviceOutputSchema>;

export async function getUpgradeAdvice(input: UpgradeAdviceInput): Promise<UpgradeAdviceOutput> {
  return upgradeAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'upgradeAdvisorPrompt',
  input: {schema: UpgradeAdviceInputSchema},
  output: {schema: UpgradeAdviceOutputSchema},
  prompt: `You are an expert in spaceship upgrades in the Cosmic Clash Arena game. Analyze the player's current situation and suggest the most impactful upgrades.

Player Level: {{{level}}}
Ship Type: {{{shipType}}}
Available Resources: Money: {{{resources.money}}}, Ore: {{{resources.ore}}}, Gas: {{{resources.gas}}}}

Consider the player's level, ship type, and available resources to recommend upgrades that will significantly improve their performance in the game.
Reason about the advantages of each upgrade and how it will help the player, given their current situation. Consider what the player has already upgraded.

Suggest the best upgrades that will give the player the most advantage, and explain your reasoning for each suggestion.

Here is a list of current upgrades: {{#each currentUpgrades}}{{{@key}}}: {{{this}}} {{/each}}.

Focus on the upgrades that will provide the biggest performance improvements, given the resources available.`,
});

const upgradeAdvisorFlow = ai.defineFlow(
  {
    name: 'upgradeAdvisorFlow',
    inputSchema: UpgradeAdviceInputSchema,
    outputSchema: UpgradeAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
