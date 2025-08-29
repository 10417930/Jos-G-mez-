import React from 'react';
import type { File } from '../types';

interface StatusBarProps {
  activeFile: File | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ activeFile }) => {
  return (
    <div className="bg-slate-950/50 border-t border-slate-700/50 px-4 py-1 text-xs text-slate-500 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center space-x-4">
        <span>
            {activeFile ? `${activeFile.path}` : 'No file selected'}
        </span>
        {activeFile && <div className="h-3 w-px bg-slate-700" />}
        {activeFile && <span>Ln 1, Col 1</span>}
      </div>
      <div>
        UTF-8
      </div>
    </div>
  );
};

export default StatusBar;
