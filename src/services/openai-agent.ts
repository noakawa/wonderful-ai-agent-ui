import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

export const createRealtimeAgent = async (): Promise<RealtimeSession | null> => {
  // Check if API key is available
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('VITE_OPENAI_API_KEY is not set in environment variables');
    return null;
  }

  try {
    const agent = new RealtimeAgent({
      name: 'Assistant',
      instructions: 'You are a helpful assistant, and you only speak in Hebrew',
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