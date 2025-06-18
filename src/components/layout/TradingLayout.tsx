import React from "react";

interface TradingLayoutProps {
  navigation: React.ReactNode;
  mainContent: React.ReactNode;
}

export const TradingLayout: React.FC<TradingLayoutProps> = ({
  navigation,
  mainContent,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        {navigation}
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {mainContent}
      </div>
    </div>
  );
};
