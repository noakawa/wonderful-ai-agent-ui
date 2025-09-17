import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

// Hardcoded medications data
const medications_data = `Acamol (Acetaminophen) 500mg tablets

Active ingredient: Acetaminophen 500mg
Used for: Pain relief and fever reduction
Dosage: 1-2 tablets every 4-6 hours, maximum 8 tablets per day
Contraindications: Severe liver disease
Side effects: Rare at recommended doses

Advil (Ibuprofen) 400mg tablets

Active ingredient: Ibuprofen 400mg
Used for: Pain relief, inflammation reduction, fever reduction
Dosage: 1 tablet every 6-8 hours with food, maximum 3 tablets per day

Augmentin 625mg tablets

Active ingredient: Amoxicillin 500mg + Clavulanic acid 125mg
Used for: Bacterial infections (requires prescription)
Dosage: 1 tablet twice daily with meals for 7-10 days

Claritin (Loratadine) 10mg tablets

Active ingredient: Loratadine 10mg
Used for: Allergic rhinitis, hay fever, hives
Dosage: 1 tablet once daily`;

// Function to load instructions from agent.txt
const loadInstructions = async (): Promise<string> => {
  const response = await fetch('/prompts/assistant.txt');
    const text = await response.text();
    return text.replace('{medications_data}', medications_data);
};

export const createRealtimeAgent = async (): Promise<RealtimeSession | null> => {
  // Check if API key is available
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('VITE_OPENAI_API_KEY is not set in environment variables');
    return null;
  }

  // Load instructions from agent.txt
  const instructions = await loadInstructions();

  try {
    const agent = new RealtimeAgent({
      name: 'Pharmacist Assistant',
      instructions: instructions,
    });
    

    const session = new RealtimeSession(agent);
    try {
      await session.connect({
        // To get this ephemeral key string, you can run the following command or implement the equivalent on the server side:
        // curl -s -X POST https://api.openai.com/v1/realtime/client_secrets -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d '{"session": {"type": "realtime", "model": "gpt-realtime"}}' | jq .value
        apiKey: apiKey,
      });
      console.log('You are connected!');
      return session;
  } catch (e) {
    console.error(e);
    return null;
  }

  } catch (error) {
    console.error('Failed to connect to OpenAI agent:', error);
    return null;
  }
};