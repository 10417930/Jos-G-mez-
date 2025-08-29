import React, { useEffect, useRef } from 'react';
import { RefreshIcon } from './Icons';

interface BottomPanelProps {
  output: string[];
  previewContent: string;
  activeTab: 'console' | 'preview';
  setActiveTab: (tab: 'console' | 'preview') => void;
  onRefreshPreview: () => void;
  isLoading: boolean;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-sky-300 border-b-2 border-sky-400'
        : 'text-slate-400 hover:text-slate-200'
    }`}
  >
    {label}
  </button>
);

const BottomPanel: React.FC<BottomPanelProps> = ({
  output,
  previewContent,
  activeTab,
  setActiveTab,
  onRefreshPreview,
  isLoading,
}) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'console') {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, activeTab]);

  return (
    <div className="h-full flex flex-col bg-slate-800/70">
      <div className="flex items-center justify-between border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center">
          <TabButton label="Console" isActive={activeTab === 'console'} onClick={() => setActiveTab('console')} />
          <TabButton label="Preview" isActive={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
        </div>
        {activeTab === 'preview' && (
          <div className="px-4">
              <button
                onClick={onRefreshPreview}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 transition-colors"
                title="Refresh Preview"
                disabled={isLoading}
              >
                  <RefreshIcon />
              </button>
          </div>
        )}
      </div>
      <div className="flex-grow overflow-auto">
        {activeTab === 'console' && (
          <div className="p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap">
            {output.map((line, index) => (
              <div key={index} className="flex">
                <span className="text-slate-500 mr-4 select-none">{String(index + 1).padStart(3, ' ')}</span>
                <span className="flex-1">{line}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        )}
        {activeTab === 'preview' && (
          <iframe
            srcDoc={previewContent}
            title="Preview"
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
};

export default BottomPanel;
