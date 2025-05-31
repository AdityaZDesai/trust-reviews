'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SlackConnectButtonProps {
  isConnected?: boolean;
}

const SlackConnectButton: React.FC<SlackConnectButtonProps> = ({ isConnected = false }) => {
  const [loading, setLoading] = useState(false);
  
  const handleConnect = async () => {
    setLoading(true);
    // Redirect to our Slack OAuth endpoint
    window.location.href = '/api/slack/oauth';
  };
  
  return (
    <Button
      onClick={handleConnect}
      disabled={loading || isConnected}
      className={`flex items-center gap-2 ${isConnected ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      <img 
        src="/slack-logo.svg" 
        alt="Slack" 
        className="w-5 h-5" 
      />
      {loading ? 'Connecting...' : isConnected ? 'Connected to Slack' : 'Connect to Slack'}
    </Button>
  );
};

export default SlackConnectButton;