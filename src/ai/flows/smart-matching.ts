'use server';
/**
 * @fileOverview This file contains the Genkit flow for intelligent worker matching.
 *
 * - intelligentWorkerMatching - A function that matches customer service requests with suitable workers and confirms/adjusts quote.
 * - IntelligentWorkerMatchingInput - The input type for the intelligentWorkerMatching function.
 * - IntelligentWorkerMatchingOutput - The return type for the intelligentWorkerMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {findWorkersNear, Location} from '@/services/geo'; // Assuming findWorkersNear is updated or we add more logic
import { serviceCategories, ServiceItem as AppServiceItem } from '@/lib/constants'; // For service details

// Map AppServiceItem to a Zod schema for the flow input
const ServiceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  estimatedTimeMinutes: z.number(),
  materialFee: z.number(),
});

const IntelligentWorkerMatchingInputSchema = z.object({
  serviceType: z.string().describe('A general description of the service category, e.g., "Custom Domestic Services".'),
  location: z.object({
    lat: z.number().describe('The latitude of the customer location.'),
    lng: z.number().describe('The longitude of the customer location.'),
  }).describe('The location of the customer.'),
  dateTime: z.string().describe('The requested date and time for the service (ISO format). This is the customer\'s preferred start time.'),
  requiredSkills: z.array(z.string()).describe('A list of high-level skills/categories based on selected services (e.g., ["Essential Tidying", "Laundry & Linen Care"]).'),
  radiusInKm: z.number().describe('The search radius in kilometers for available workers.'),
  selectedServiceItems: z.array(z.string()).describe('A list of IDs of the specific service items selected by the customer (e.g., ["et-sweep-mop", "ll-ironing"]).'),
  estimatedDurationHours: z.number().describe('The system-calculated estimated duration for all selected services in hours.'),
  estimatedTotalCost: z.number().describe('The system-calculated estimated total cost (labor + materials) in Rands.'),
  customerNotes: z.string().optional().describe('Any additional notes or special instructions from the customer.'),
});
export type IntelligentWorkerMatchingInput = z.infer<typeof IntelligentWorkerMatchingInputSchema>;

const IntelligentWorkerMatchingOutputSchema = z.object({
  workerId: z.string().describe('The ID of the worker best matched to the request.'),
  estimatedPrice: z.number().describe('The final estimated price for the service, potentially adjusted by the AI based on complexity or worker availability. This should be in Rands.'),
  estimatedDurationMinutes: z.number().describe('The final estimated duration of the service in minutes, potentially adjusted by the AI.'),
  confirmationNotes: z.string().optional().describe('Any notes from the AI regarding the match or adjustments to the quote.'),
});
export type IntelligentWorkerMatchingOutput = z.infer<typeof IntelligentWorkerMatchingOutputSchema>;

export async function intelligentWorkerMatching(input: IntelligentWorkerMatchingInput): Promise<IntelligentWorkerMatchingOutput> {
  return intelligentWorkerMatchingFlow(input);
}

// Helper function to get service item details from IDs
function getServiceItemDetails(itemIds: string[]): AppServiceItem[] {
  const allItemsMap = new Map<string, AppServiceItem>();
  serviceCategories.forEach(category => {
    category.items.forEach(item => {
      allItemsMap.set(item.id, item);
    });
  });
  return itemIds.map(id => allItemsMap.get(id)).filter(item => item !== undefined) as AppServiceItem[];
}


const workerMatchingPrompt = ai.definePrompt({
  name: 'workerMatchingPrompt',
  input: { schema: IntelligentWorkerMatchingInputSchema },
  output: { schema: IntelligentWorkerMatchingOutputSchema },
  prompt: `You are an expert scheduling and quoting assistant for Clean Slate, a domestic services company.
Your task is to find the best available worker for a customer's request, confirm the service details, and provide a final quote.

Customer Request Details:
- Service Type: {{{serviceType}}}
- Location: Latitude: {{{location.lat}}}, Longitude: {{{location.lng}}}
- Preferred Date and Time: {{{dateTime}}}
- Requested Service Categories: {{#each requiredSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Specific Service Items (IDs): {{#each selectedServiceItems}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- System Estimated Duration: {{{estimatedDurationHours}}} hours
- System Estimated Total Cost: R{{{estimatedTotalCost}}}
- Customer Notes: {{{customerNotes}}}

Available Workers (IDs): {{{nearbyWorkerInfo}}}

Instructions:
1. Review the list of selected service items and the customer's notes.
2. Based on the service items, customer notes, and typical worker efficiency, confirm if the system's estimated duration ({{{estimatedDurationHours}}} hours) and cost (R{{{estimatedTotalCost}}}) are reasonable.
   - You can slightly adjust the duration (in minutes) and total price (in Rands) if you believe it's necessary due to complexity implied by notes or combination of services. Explain any adjustments in 'confirmationNotes'.
   - Worker's standard hourly rate is R${WORKER_HOURLY_RATE}. Material fees are included in the system's estimated cost.
3. From the list of nearby available worker IDs ({{{nearbyWorkerInfo}}}), select the MOST SUITABLE worker. Consider their (hypothetical) skills align with the 'Requested Service Categories'.
   - If no workers are provided or suitable, state this clearly. For this simulation, assume at least one worker from the list is suitable if the list is not empty.
4. Output the matched worker's ID, the final estimated price, and the final estimated duration in minutes.

Example Output Format (JSON):
{
  "workerId": "workerX",
  "estimatedPrice": 250.00,
  "estimatedDurationMinutes": 150,
  "confirmationNotes": "Adjusted duration slightly due to request for deep cleaning of oven."
}

If no suitable worker can be found from the provided list, use "NO_WORKER_AVAILABLE" for workerId and explain in confirmationNotes.
The list of selected service items with their names and individual estimates are:
{{#each serviceItemDetails}}
  - {{name}} (ID: {{id}}): {{estimatedTimeMinutes}} mins, R{{materialFee}} material fee
{{/each}}

Begin!
`,
});

const intelligentWorkerMatchingFlow = ai.defineFlow(
  {
    name: 'intelligentWorkerMatchingFlow',
    inputSchema: IntelligentWorkerMatchingInputSchema,
    outputSchema: IntelligentWorkerMatchingOutputSchema,
  },
  async (input) => {
    // Find workers near the customer's location (simulated)
    const nearbyWorkerIds = await findWorkersNear(input.location, input.radiusInKm);

    if (nearbyWorkerIds.length === 0) {
      // This case should ideally be handled before calling the AI, or AI is instructed how to respond.
      // For now, let AI handle it as per prompt instructions.
      // throw new Error('No workers found nearby. Please expand search radius or try a different time.');
    }
    
    const serviceItemDetails = getServiceItemDetails(input.selectedServiceItems);

    // Augment input for the prompt with worker availability and service details
    const promptInput = {
      ...input,
      nearbyWorkerInfo: nearbyWorkerIds.length > 0 ? nearbyWorkerIds.join(', ') : 'No nearby workers found by the system.',
      serviceItemDetails: serviceItemDetails, // Pass detailed items to the prompt
    };
    
    const { output } = await workerMatchingPrompt(promptInput);

    if (!output) {
        throw new Error('AI failed to generate a response for worker matching.');
    }
    if (output.workerId === "NO_WORKER_AVAILABLE") {
        throw new Error(output.confirmationNotes || "No suitable worker could be matched for your request at this time.");
    }

    return output;
  }
);
