import { useState, useMemo, useCallback } from 'react';
import type { File } from '../types';

const initialFiles: File[] = [
  {
    id: '1',
    name: 'public',
    path: '/public',
    type: 'folder',
    content: '',
    children: [
      {
        id: '2',
        name: 'index.html',
        path: '/public/index.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Awesome App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Welcome!</h1>
  <p>This is a sample project.</p>
  <script src="script.js"></script>
</body>
</html>`,
      },
    ],
  },
  {
    id: '3',
    name: 'src',
    path: '/src',
    type: 'folder',
    content: '',
    children: [
      {
        id: '4',
        name: 'style.css',
        path: '/src/style.css',
        type: 'file',
        content: `body {
  font-family: sans-serif;
  background-color: #f0f0f0;
  color: #333;
}`,
      },
      {
        id: '5',
        name: 'script.js',
        path: '/src/script.js',
        type: 'file',
        content: `// Welcome to your project!
// Feel free to edit this file.

function changeHeaderColor() {
  const heading = document.querySelector('h1');
  if (heading) {
    heading.style.color = 'deepskyblue';
  }
}

function createGreeting() {
    const container = document.body;
    const existingGreeting = document.getElementById('greeting');
    if (existingGreeting) {
        container.removeChild(existingGreeting);
    }

    const name = "User"; // Try changing this!
    const p = document.createElement('p');
    p.id = 'greeting';
    p.textContent = \`Hello, \${name}! This element was added by JavaScript.\`;
    container.appendChild(p);

    // This loop is just for demonstration
    // It could be inefficient on a large scale.
    let count = 0;
    for (let i = 0; i < 1000; i++) {
        count += i;
    }
    console.log('Calculation finished. Sum:', count);
}

document.addEventListener('DOMContentLoaded', () => {
    changeHeaderColor();
    createGreeting();
});`,
      },
    ],
  },
  {
    id: '6',
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    content: `{
  "name": "web-ide-project",
  "version": "1.0.0",
  "description": "A sample project for the Web IDE",
  "main": "src/script.js",
  "scripts": {
    "start": "node ."
  }
}`,
  },
];

const findFileById = (files: File[], id: string): File | null => {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
};

const updateFileInTree = (files: File[], id: string, newContent: string): File[] => {
  return files.map(file => {
    if (file.id === id) {
      return { ...file, content: newContent };
    }
    if (file.children) {
      return { ...file, children: updateFileInTree(file.children, id, newContent) };
    }
    return file;
  });
};

const getDefaultOpenFile = (files: File[]): File | null => {
    return findFileById(files, '5'); // Default to script.js
}

export default function useFileSystem() {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const defaultFile = getDefaultOpenFile(initialFiles);
  
  const [openFiles, setOpenFiles] = useState<File[]>(defaultFile ? [defaultFile] : []);
  const [activeFileId, setActiveFileId] = useState<string | null>(defaultFile?.id || null);

  const activeFile = useMemo(() => {
    if (!activeFileId) return null;
    // Get the latest content from the main files tree
    return findFileById(files, activeFileId);
  }, [files, activeFileId]);
  
  const selectFile = useCallback((file: File) => {
    if (file.type === 'file') {
      // Check if file is already open
      if (!openFiles.some(openedFile => openedFile.id === file.id)) {
        setOpenFiles(prev => [...prev, file]);
      }
      setActiveFileId(file.id);
    }
  }, [openFiles]);

  const setActiveFile = useCallback((file: File) => {
      setActiveFileId(file.id);
  }, []);

  const closeFile = useCallback((fileToClose: File) => {
    const fileIndex = openFiles.findIndex(f => f.id === fileToClose.id);
    if (fileIndex === -1) return;

    // Determine the next active file
    if (activeFileId === fileToClose.id) {
        if (openFiles.length === 1) {
            setActiveFileId(null);
        } else if (fileIndex > 0) {
            setActiveFileId(openFiles[fileIndex - 1].id);
        } else {
            setActiveFileId(openFiles[fileIndex + 1].id);
        }
    }
    setOpenFiles(prev => prev.filter(f => f.id !== fileToClose.id));
  }, [openFiles, activeFileId]);

  const updateFileContent = (id: string, newContent: string) => {
    setFiles(prevFiles => updateFileInTree(prevFiles, id, newContent));
  };

  return { files, activeFile, openFiles, updateFileContent, selectFile, closeFile, setActiveFile };
}