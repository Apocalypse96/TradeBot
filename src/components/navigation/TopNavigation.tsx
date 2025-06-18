import React from "react";
import { Button } from "../ui/Button";

interface TopNavigationProps {
  currentTime: Date;
  conversationStep: string;
  onReset: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ onReset }) => {
  return (
    <nav className="w-full">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* App Logo/Name */}
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">
              🎤 VoiceTrader Pro
            </h1>
            <span className="text-xs bg-blue-600/20 px-2 py-1 rounded-full border border-blue-500/30 text-blue-300">
              BETA
            </span>
          </div>

          {/* Reset Button */}
          <Button
            variant="secondary"
            onClick={onReset}
            className="text-sm px-4 py-2"
          >
            Reset
          </Button>
        </div>
      </div>
    </nav>
  );
};
