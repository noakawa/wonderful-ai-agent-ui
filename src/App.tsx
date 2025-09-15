import React, { useState, useRef, useEffect } from 'react';
import { RealtimeSession } from '@openai/agents/realtime';
import { CallState, Message } from './types';
import { playBeepSound } from './utils/audio';
import { createRealtimeAgent, disconnectRealtimeAgent } from './services/openai-agent';
import { CallControls, CallStatus, MessageList } from './components';


function App() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const beepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeSessionRef = useRef<RealtimeSession | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (transcript) {
          addMessage(transcript, 'user');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (beepTimerRef.current) clearTimeout(beepTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (callState === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        setCallDuration(0);
      }
    }

    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callState]);

  
  const startCall = () => {
    setCallState('calling');
    setMessages([]);
    
    // Play beeping sounds
    const playBeeps = () => {
      playBeepSound();
      beepTimerRef.current = setTimeout(playBeeps, 1000);
    };
    playBeeps();

    // Agent picks up after 3-4 beeps
    setTimeout(() => {
      if (beepTimerRef.current) clearTimeout(beepTimerRef.current);
      setCallState('connected');

      // Start agent connection
      setTimeout(async () => {
        const session = await createRealtimeAgent();
        if (session) {
          realtimeSessionRef.current = session;
          console.log('Agent session established successfully');
        } else {
          console.error('Failed to establish agent session');
        }
      }, 2000);
    }, 3500);
  };

  const endCall = () => {
    setCallState('ended');
    if (beepTimerRef.current) clearTimeout(beepTimerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    speechSynthesis.cancel();
    setIsListening(false);

    setTimeout(() => {
      setCallState('idle');
      setMessages([]);
    }, 2000);
  };

  const addMessage = (text: string, sender: 'user' | 'agent') => {
    const message: Message = {
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };


  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      speechSynthesis.cancel();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Voice Agent</h1>
              <p className="text-blue-100 text-sm">AI Assistant Call</p>
            </div>
          </div>
        </div>

        <CallStatus
          callState={callState}
          callDuration={callDuration}
          isListening={isListening}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />

        <MessageList messages={messages} />

        <CallControls
          callState={callState}
          onStartCall={startCall}
          onEndCall={endCall}
        />

      </div>
    </div>
  );
}

export default App;