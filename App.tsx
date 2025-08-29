import React, { useState, useCallback, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import BottomPanel from './components/Terminal';
import Toolbar from './components/Toolbar';
import EditorTabs from './components/EditorTabs';
import StatusBar from './components/StatusBar';
import useFileSystem from './hooks/useFileSystem';
import useResizablePanels from './hooks/useResizablePanels';
import { simulateTest, analyzeCode } from './services/geminiService';
import type { File } from './types';
import { ProjectIcon } from './components/Icons';

export default function App() {
  const { 
    files, 
    activeFile, 
    openFiles,
    updateFileContent, 
    selectFile,
    closeFile,
    setActiveFile
  } = useFileSystem();
  
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Welcome to the Gemini Web IDE!']);
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'console' | 'preview'>('console');
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);

  const {
    explorerWidth,
    editorHeight,
    verticalDragHandleProps,
    horizontalDragHandleProps
  } = useResizablePanels({
    initialExplorerWidth: 280,
    initialEditorHeight: window.innerHeight * 0.6,
    minExplorerWidth: 200,
    minEditorHeight: 150,
  });

  const clearTerminal = () => setTerminalOutput([]);

  const addToOutput = (output: string) => {
    setTerminalOutput(prev => [...prev, ...output.split('\n')]);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, message } = event.data;
      if (type === 'console_log') {
        addToOutput(`[LOG] ${message}`);
      } else if (type === 'console_error') {
        addToOutput(`[ERR] ${message}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const generatePreviewHtml = useCallback(() => {
    const findFileByName = (name: string, dir: File[]): File | null => {
      for (const file of dir) {
        if (file.type === 'file' && file.name === name) {
          return file;
        }
        if (file.children) {
          const found = findFileByName(name, file.children);
          if (found) return found;
        }
      }
      return null;
    };

    const htmlFile = findFileByName('index.html', files);
    const cssFile = findFileByName('style.css', files);
    const jsFile = findFileByName('script.js', files);
    
    const interceptorScript = `
      <script>
        const originalLog = console.log;
        const originalError = console.error;

        const safeStringify = (obj) => {
          try {
            return JSON.stringify(obj, null, 2);
          } catch (e) {
            return '[Unserializable Object]';
          }
        };

        console.log = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? safeStringify(arg) : String(arg)).join(' ');
          window.parent.postMessage({ type: 'console_log', message }, '*');
          originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
          const message = args.map(arg => typeof arg === 'object' ? safeStringify(arg) : String(arg)).join(' ');
          window.parent.postMessage({ type: 'console_error', message }, '*');
          originalError.apply(console, args);
        };
        
        window.addEventListener('error', (event) => {
          window.parent.postMessage({ 
            type: 'console_error', 
            message: \`Uncaught Error: \${event.message} at \${event.filename}:\${event.lineno}\`
          }, '*');
        });
      </script>
    `;

    if (!htmlFile) {
      setPreviewContent('<body><h1>Error: index.html not found in project.</h1></body>');
      return;
    }

    let content = htmlFile.content;
    
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${interceptorScript}</head>`);
    } else {
        content = interceptorScript + content;
    }

    if (cssFile) {
      content = content.replace(/<link[^>]*\s+href="style\.css"[^>]*>/, `<style>${cssFile.content}</style>`);
    }
    if (jsFile) {
      content = content.replace(/<script[^>]*\s+src="script\.js"[^>]*>[\s\S]*?<\/script>/, `<script>${jsFile.content}</script>`);
    }
    
    setPreviewContent(content);
  }, [files]);

  const handleRefreshPreview = useCallback(() => {
    generatePreviewHtml();
    setActiveTab('preview');
  }, [generatePreviewHtml]);

  const handleRun = useCallback(() => {
    if (isLoading) return;
    clearTerminal();
    addToOutput(`> Executing code...`);
    generatePreviewHtml();
    setActiveTab('preview');
    addToOutput(`> View the result in the Preview tab. Console is listening for logs.`);
  }, [isLoading, generatePreviewHtml]);

  const handleTest = useCallback(async () => {
    if (!activeFile || isLoading) return;
    setActiveTab('console');
    setIsLoading(true);
    clearTerminal();
    addToOutput(`> Generating tests for ${activeFile.name}...`);
    try {
      const result = await simulateTest(activeFile.content);
      addToOutput(result);
    } catch (error) {
      console.error(error);
      addToOutput(`Error generating tests: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeFile, isLoading]);

  const handleAskAI = useCallback(async () => {
    if (!activeFile || isLoading) return;
    setActiveTab('console');
    setIsLoading(true);
    clearTerminal();
    addToOutput(`> Asking AI about ${activeFile.name}...`);
    try {
      const result = await analyzeCode(activeFile.content);
      addToOutput(result);
    } catch (error) {
      console.error(error);
      addToOutput(`Error asking AI: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeFile, isLoading]);


  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-300 flex flex-col font-sans">
      <header className="bg-slate-950/70 border-b border-slate-700/50 px-4 py-1 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center">
             <h1 className="text-lg font-bold text-slate-300 mr-6">
                <span className="text-sky-400">Gemini</span> Web IDE
            </h1>
        </div>
        <Toolbar onRun={handleRun} onTest={handleTest} onAskAI={handleAskAI} isLoading={isLoading} />
      </header>
      <main className="flex-grow flex overflow-hidden">
        {/* Tool Window Bar */}
        <div className="bg-slate-900 border-r border-slate-700/50 flex flex-col items-center p-1 space-y-2">
            <button 
                title="Project" 
                onClick={() => setIsExplorerVisible(!isExplorerVisible)}
                className={`p-2 rounded-md transition-colors ${isExplorerVisible ? 'bg-slate-700/80 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
            >
                <ProjectIcon />
            </button>
        </div>

        {/* Resizable Content Area */}
        <div className="flex flex-grow overflow-hidden">
            {isExplorerVisible && (
              <>
                <aside 
                    style={{ width: `${explorerWidth}px` }} 
                    className="bg-slate-800/50 flex-shrink-0 overflow-y-auto"
                >
                    <FileExplorer files={files} activeFile={activeFile} onSelectFile={selectFile} />
                </aside>
                <div 
                    {...verticalDragHandleProps}
                    className="w-1.5 flex-shrink-0 cursor-col-resize bg-slate-800/50 hover:bg-sky-400/50 transition-colors duration-200"
                    aria-label="Resize file explorer"
                />
              </>
            )}

            <div className="flex-grow flex flex-col overflow-hidden">
                <div style={{ height: `${editorHeight}px` }} className="flex-shrink-0 flex flex-col">
                    <EditorTabs 
                        openFiles={openFiles} 
                        activeFile={activeFile} 
                        onSelectTab={setActiveFile} 
                        onCloseTab={closeFile} 
                    />
                    <CodeEditor
                        key={activeFile?.id}
                        file={activeFile}
                        onContentChange={(newContent) => {
                            if (activeFile) {
                                updateFileContent(activeFile.id, newContent);
                            }
                        }}
                    />
                </div>
                <div 
                    {...horizontalDragHandleProps}
                    className="h-1.5 flex-shrink-0 cursor-row-resize bg-slate-800/50 hover:bg-sky-400/50 transition-colors duration-200"
                    aria-label="Resize terminal panel"
                />
                <div className="flex-grow flex flex-col">
                    <BottomPanel
                        output={terminalOutput}
                        previewContent={previewContent}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onRefreshPreview={handleRefreshPreview}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
      </main>
      <StatusBar activeFile={activeFile} />
    </div>
  );
}