import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { CallState } from '../types';
import { formatDuration } from '../utils/audio';

interface CallStatusProps {
  callState: CallState;
  callDuration: number;
  isListening: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

const getCallStateColor = (callState: CallState): string => {
  switch (callState) {
    case 'calling': return 'bg-yellow-500';
    case 'connected': return 'bg-green-500';
    case 'ended': return 'bg-red-500';
    default: return 'bg-blue-500';
  }
};

const getCallStateText = (callState: CallState, callDuration: number): string => {
  switch (callState) {
    case 'calling': return 'Calling...';
    case 'connected': return `Connected - ${formatDuration(callDuration)}`;
    case 'ended': return 'Call Ended';
    default: return 'Ready to Call';
  }
};

export const CallStatus: React.FC<CallStatusProps> = ({
  callState,
  callDuration,
  isListening,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="p-6 text-center">
      <div className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-medium ${getCallStateColor(callState)}`}>
        {getCallStateText(callState, callDuration)}
      </div>

      {callState === 'connected' && (
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isListening ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="text-xs">{isListening ? 'Listening' : 'Muted'}</span>
          </div>
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-full ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'} hover:bg-opacity-30 transition-colors`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};