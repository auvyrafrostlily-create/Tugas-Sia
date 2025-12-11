import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  // State to hold the prompt triggered by clicking a sidebar item
  const [suggestedPrompt, setSuggestedPrompt] = useState<string>('');

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless toggled */}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          activeAgent={activeAgent} 
          onSelectAgent={(prompt) => {
            setSuggestedPrompt(prompt);
            setIsSidebarOpen(false); // Close sidebar on mobile after selection
          }} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="font-bold text-slate-800">SIMRS-AI</div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <ChatInterface 
          onAgentActivity={setActiveAgent} 
          suggestedPrompt={suggestedPrompt}
          onPromptHandled={() => setSuggestedPrompt('')} // Reset after processing
        />
      </div>
    </div>
  );
};

export default App;