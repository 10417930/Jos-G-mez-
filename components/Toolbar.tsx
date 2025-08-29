import React from 'react';
import { PlayIcon, TestIcon, LoadingSpinner, SparklesIcon } from './Icons';

interface ToolbarProps {
  onRun: () => void;
  onTest: () => void;
  onAskAI: () => void;
  isLoading: boolean;
}

const ToolbarButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    label: string;
    iconColorClass: string;
}> = ({ onClick, disabled, children, label, iconColorClass }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        title={label}
    >
        <span className={iconColorClass}>{children}</span>
    </button>
);


const Toolbar: React.FC<ToolbarProps> = ({ onRun, onTest, onAskAI, isLoading }) => {
  return (
    <div className="flex items-center space-x-2">
        {isLoading && <div className="p-1.5"><LoadingSpinner /></div>}
        <ToolbarButton onClick={onAskAI} disabled={isLoading} label="Ask AI" iconColorClass="text-purple-400">
            <SparklesIcon />
        </ToolbarButton>
        <div className="h-6 w-px bg-slate-700/50"></div>
        <ToolbarButton onClick={onRun} disabled={isLoading} label="Run" iconColorClass="text-green-400">
            <PlayIcon />
        </ToolbarButton>
        <ToolbarButton onClick={onTest} disabled={isLoading} label="Generate Tests" iconColorClass="text-yellow-400">
            <TestIcon />
        </ToolbarButton>
    </div>
  );
};

export default Toolbar;