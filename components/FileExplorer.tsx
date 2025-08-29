
import React from 'react';
import type { File } from '../types';
import { FileIcon, ChevronRightIcon, ChevronDownIcon } from './Icons';

interface FileExplorerProps {
  files: File[];
  activeFile: File | null;
  onSelectFile: (file: File) => void;
}

const FileEntry: React.FC<{
  entry: File;
  activeFile: File | null;
  onSelectFile: (file: File) => void;
  level?: number;
}> = ({ entry, activeFile, onSelectFile, level = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const isFolder = entry.type === 'folder';
  const isActive = activeFile?.id === entry.id;

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
        onSelectFile(entry);
    }
  };

  return (
    <div>
      <div
        onClick={handleToggle}
        className={`flex items-center px-4 py-1 cursor-pointer hover:bg-slate-700/40 rounded-md mx-2 ${isActive ? 'bg-slate-700/50 text-sky-300' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
      >
        <span className="mr-2 w-5 h-5 flex-shrink-0 flex items-center justify-center text-slate-400">
          {isFolder ? (isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />) : <FileIcon />}
        </span>
        <span className="truncate">{entry.name}</span>
      </div>
      {isFolder && isOpen && entry.children && (
        <div className="mt-1">
          {entry.children.map(child => (
            <FileEntry key={child.id} entry={child} activeFile={activeFile} onSelectFile={onSelectFile} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, onSelectFile }) => {
  return (
    <div className="py-2">
       <h2 className="px-4 py-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Project</h2>
      {files.map(entry => (
        <FileEntry key={entry.id} entry={entry} activeFile={activeFile} onSelectFile={onSelectFile} />
      ))}
    </div>
  );
};

export default FileExplorer;