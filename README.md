# AI Pharmacist Agent

A Hebrew-speaking AI pharmacist agent built with React, TypeScript, and OpenAI's Realtime API. This application provides a phone-like interface where users can call and speak with an AI pharmacist about available medications.

## Features

- 📞 **Phone-like Interface**: Realistic calling experience with beep sounds
- 🗣️ **Voice Interaction**: Speech recognition and text-to-speech capabilities
- 🇮🇱 **Hebrew Support**: AI agent responds only in Hebrew
- 💊 **Medication Information**: Provides information about available pharmacy medications
- 🎯 **Focused Responses**: Agent only answers medication-related queries
- 🔇 **Mute Function**: Toggle audio output during calls

## Prerequisites

- Node.js (v18 or higher)
- OpenAI API key with Realtime API access

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wonderful-ai-agent-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Generate and add your OpenAI ephemeral key to `.env`:

   First, export your OpenAI API key:
   ```bash
   export OPENAI_API_KEY=your_actual_openai_api_key
   ```

   Then generate an ephemeral key:
   ```bash
   curl -X POST https://api.openai.com/v1/realtime/client_secrets \
   -H "Authorization: Bearer $OPENAI_API_KEY" \
   -H "Content-Type: application/json" \
   -d '{
     "session": {
       "type": "realtime",
       "model": "gpt-realtime"
     }
   }
   ```

   Add the generated ephemeral key (starts with `ek_`) to `.env`:
   ```bash
   VITE_OPENAI_API_KEY=ek_your_generated_ephemeral_key_here
   ```

   **Note**: Ephemeral keys are temporary and expire. You'll need to regenerate them periodically.

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

3. Click the "Call" button to start a conversation with the AI pharmacist

4. Speak in any language - the agent will respond in Hebrew

## Configuration

### Medications Data

The available medications are configured in `src/services/openai-agent.ts`. You can modify the `medications_data` variable to update the pharmacy inventory.

### Agent Instructions

The AI agent's behavior is defined in `public/prompts/assistant.txt`. The agent is configured to:
- Only speak Hebrew
- Provide information about available medications
- Not give medical advice
- Redirect medical questions to healthcare professionals
- Keep responses to 3 sentences or less

## Project Structure

```
src/
├── components/          # React components
│   ├── CallControls.tsx # Call start/end buttons
│   ├── CallStatus.tsx   # Call status display
│   └── MessageList.tsx  # Message history
├── services/
│   └── openai-agent.ts  # OpenAI Realtime API integration
├── utils/
│   └── audio.ts         # Audio utilities (beep sounds)
├── types/
│   └── index.ts         # TypeScript type definitions
└── App.tsx              # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **OpenAI Realtime API** - AI agent functionality
- **Web Speech API** - Speech recognition
- **Web Audio API** - Audio generation

## License

This project is private and not licensed for public use.
