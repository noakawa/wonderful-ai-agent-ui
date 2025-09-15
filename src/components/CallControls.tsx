import React from 'react';
import { Phone, PhoneCall } from 'lucide-react';
import { CallState } from '../types';

interface CallControlsProps {
  callState: CallState;
  onStartCall: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  callState,
  onStartCall,
  onEndCall,
}) => {
  return (
    <div className="p-6 flex justify-center space-x-4">
      {callState === 'idle' && (
        <button
          onClick={onStartCall}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg"
        >
          <Phone className="w-5 h-5" />
          <span>Call Agent</span>
        </button>
      )}

      {(callState === 'calling' || callState === 'connected') && (
        <button
          onClick={onEndCall}
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
  );
};