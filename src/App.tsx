import React, { useState, useRef, useEffect } from 'react';
import { Phone, PhoneCall, Volume2, Mic, MicOff } from 'lucide-react';

type CallState = 'idle' | 'calling' | 'connected' | 'ended';

interface Message {
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const agentResponses = [
  "Hello! This is Agent Sarah. How can I help you today?",
  "I understand. Can you tell me more about that?",
  "That's interesting. What would you like to know?",
  "I see. Let me help you with that.",
  "Is there anything specific you'd like assistance with?",
  "Thank you for sharing that. How else can I support you?",
  "I'm here to help. What's your main concern today?",
  "That makes sense. Would you like me to explain further?",
  "I appreciate you calling. What can I do for you?",
  "Let me make sure I understand correctly..."
];

function App() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const beepTimerRef = useRef<NodeJS.Timeout | null>(null);

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
          handleAgentResponse();
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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playBeepSound = () => {
    // Create beeping sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

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
      
      // Agent greeting
      setTimeout(() => {
        const greeting = "Hello! This is Agent Sarah. How can I help you today?";
        addMessage(greeting, 'agent');
        speakText(greeting);
        
        // Start listening after greeting
        setTimeout(() => {
          startListening();
        }, 2000);
      }, 500);
    }, 3500);
  };

  const endCall = () => {
    setCallState('ended');
    if (beepTimerRef.current) clearTimeout(beepTimerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (synthesisRef.current) speechSynthesis.cancel();
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

  const speakText = (text: string) => {
    if (!isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to find a female voice
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('sarah') ||
        voice.name.toLowerCase().includes('samantha')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const handleAgentResponse = () => {
    // Simulate thinking time
    setTimeout(() => {
      const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
      addMessage(randomResponse, 'agent');
      speakText(randomResponse);
      
      // Resume listening after agent responds
      setTimeout(() => {
        if (callState === 'connected') {
          startListening();
        }
      }, 1500);
    }, 1000 + Math.random() * 1000);
  };

  const startListening = () => {
    if (recognitionRef.current && callState === 'connected') {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      speechSynthesis.cancel();
    }
  };

  const getCallStateColor = () => {
    switch (callState) {
      case 'calling': return 'bg-yellow-500';
      case 'connected': return 'bg-green-500';
      case 'ended': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getCallStateText = () => {
    switch (callState) {
      case 'calling': return 'Calling...';
      case 'connected': return `Connected - ${formatDuration(callDuration)}`;
      case 'ended': return 'Call Ended';
      default: return 'Ready to Call';
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
            <div className={`w-4 h-4 rounded-full ${getCallStateColor()} animate-pulse`}></div>
          </div>
        </div>

        {/* Call Status */}
        <div className="p-6 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-medium ${getCallStateColor()}`}>
            {getCallStateText()}
          </div>
          
          {callState === 'connected' && (
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isListening ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="text-xs">{isListening ? 'Listening' : 'Muted'}</span>
              </div>
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'} hover:bg-opacity-30 transition-colors`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="px-6 pb-4 max-h-60 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white/20 text-white rounded-bl-md'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 flex justify-center space-x-4">
          {callState === 'idle' && (
            <button
              onClick={startCall}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              <Phone className="w-5 h-5" />
              <span>Call Agent</span>
            </button>
          )}
          
          {(callState === 'calling' || callState === 'connected') && (
            <button
              onClick={endCall}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              <PhoneCall className="w-5 h-5 transform rotate-135" />
              <span>Hang Up</span>
            </button>
          )}

          {callState === 'ended' && (
            <div className="text-center">
              <p className="text-white/70 text-sm">Call ended. You can call again.</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="px-6 pb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-white font-medium text-sm mb-2">How to use:</h3>
            <ul className="text-white/70 text-xs space-y-1">
              <li>• Click "Call Agent" to start</li>
              <li>• Wait for Agent Sarah to answer</li>
              <li>• Speak naturally when listening indicator is active</li>
              <li>• Click "Hang Up" to end the call</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;