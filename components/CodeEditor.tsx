import React from 'react';
import type { File } from '../types';

interface CodeEditorProps {
  file: File | null;
  onContentChange: (newContent: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, onContentChange }) => {
  if (!file) {
    return (
      <div className="h-full bg-slate-900 flex items-center justify-center text-slate-500">
        <p>Select a file to start editing or open one from the explorer</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 flex-grow">
      <textarea
        value={file.content}
        onChange={(e) => onContentChange(e.target.value)}
        className="w-full h-full p-4 bg-slate-900 text-slate-200 font-mono resize-none focus:outline-none"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeEditor;