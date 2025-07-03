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
  ship: z.object({
      class: z.string().describe("The class of the ship, e.g., 'Fighter' or 'Galleon'"),
      role: z.string().describe("The primary role of the ship, e.g., 'Combat' or 'Mining'"),
      size: z.string().describe("The size category of the ship, e.g., 'S' for Small"),
      upgrades: z.record(z.string(), z.number()).describe('A list of the players current upgrades and their levels')
  }).describe("The player's current ship configuration."),
  level: z.number().describe('The current level of the player.'),
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
Ship Details: Class: {{{ship.class}}}, Role: {{{ship.role}}}, Size: {{{ship.size}}}
Available Resources: Money: {{{resources.money}}}, Ore: {{{resources.ore}}}, Gas: {{{resources.gas}}}

Consider the player's level, ship details, and available resources to recommend upgrades that will significantly improve their performance in the game.
Reason about the advantages of each upgrade and how it will help the player, given their current situation. Consider what the player has already upgraded.

Suggest the best upgrades that will give the player the most advantage, and explain your reasoning for each suggestion.

Here is a list of current upgrades: {{#each ship.upgrades}}{{{@key}}}: {{{this}}} {{/each}}.

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
