import React from 'react';
import type { File } from '../types';
import { FileIcon, CloseIcon } from './Icons';

interface EditorTabsProps {
  openFiles: File[];
  activeFile: File | null;
  onSelectTab: (file: File) => void;
  onCloseTab: (file: File) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ openFiles, activeFile, onSelectTab, onCloseTab }) => {
  if (openFiles.length === 0) {
    return <div className="bg-slate-800/50 h-10 flex-shrink-0 border-b border-slate-700/50"></div>;
  }
  
  return (
    <div className="bg-slate-800/50 flex-shrink-0 border-b border-slate-700/50 flex items-end">
      <div className="flex-grow flex items-stretch overflow-x-auto">
        {openFiles.map(file => (
          <div
            key={file.id}
            onClick={() => onSelectTab(file)}
            className={`flex items-center px-4 py-2 cursor-pointer border-r border-slate-700/50 relative group ${
              activeFile?.id === file.id ? 'bg-slate-900 text-sky-300' : 'text-slate-400 hover:bg-slate-700/30'
            }`}
          >
            <span className="mr-2 w-5 h-5 flex-shrink-0">
              <FileIcon />
            </span>
            <span className="text-sm">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent tab selection when closing
                onCloseTab(file);
              }}
              className="ml-4 p-0.5 rounded-md text-slate-500 hover:bg-slate-600/50 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <CloseIcon />
            </button>
             {activeFile?.id === file.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorTabs;
