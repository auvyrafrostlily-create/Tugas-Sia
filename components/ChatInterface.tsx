import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu, Loader2, Sparkles, ArrowRight, Network, AlertTriangle } from 'lucide-react';
import { ChatManager } from '../services/geminiService';
import { Message } from '../types';

interface ChatInterfaceProps {
  onAgentActivity: (agentName: string | null) => void;
  suggestedPrompt: string;
  onPromptHandled: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAgentActivity, suggestedPrompt, onPromptHandled }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'model',
      content: 'Selamat datang di SIMRS-AI Terpadu. Saya adalah Induk Agen yang siap membantu Anda menghubungkan kebutuhan medis, administratif, dan penjadwalan.\n\nSilakan pilih modul di panel kiri atau ketik permintaan Anda di bawah.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatManagerRef = useRef<ChatManager | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
        chatManagerRef.current = new ChatManager();
    } catch (e) {
        console.error("Failed to initialize ChatManager", e);
    }
  }, []);

  // Effect to handle incoming prompts from Sidebar
  useEffect(() => {
    if (suggestedPrompt && suggestedPrompt.trim() !== '') {
      setInputValue(suggestedPrompt);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      onPromptHandled(); // Clear the prop in parent to avoid re-triggering
    }
  }, [suggestedPrompt, onPromptHandled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTool]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading || !chatManagerRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setCurrentTool(null);
    onAgentActivity(null);

    try {
      const responseText = await chatManagerRef.current.sendMessage(userMsg.content, (toolName, args) => {
        // Callback when tool is triggered
        setCurrentTool(toolName);
        onAgentActivity(toolName);
        
        // Add a simple system log to the chat (Simplified UI)
        setMessages(prev => [...prev, {
            id: Date.now().toString() + '-tool',
            role: 'system',
            content: `Processing`, 
            isToolInput: true,
            toolName: toolName,
            toolResult: args,
            timestamp: new Date()
        }]);
      });

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      console.error("HandleSendMessage Error:", error);
      let errorMessage = "Terjadi gangguan koneksi pada server SIMRS.";
      
      // Improve error reporting
      if (error.message) {
        if (error.message.includes("API_KEY")) {
            errorMessage = "Konfigurasi API Key tidak ditemukan atau salah.";
        } else if (error.message.includes("400")) {
            errorMessage = "Permintaan tidak valid (Bad Request). Silakan refresh halaman.";
        } else {
            errorMessage = `Error: ${error.message}`;
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setCurrentTool(null);
      onAgentActivity(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all ${
                msg.role === 'user' ? 'bg-white text-slate-600 border border-slate-200' : 
                msg.role === 'system' ? 'bg-transparent' : 'bg-teal-600 text-white shadow-teal-200'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : msg.role === 'system' ? null : <Bot size={22} />}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
                {msg.role === 'system' ? (
                   // Simplified Tool Execution Visualization (Biasa Saja)
                   <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 text-sm text-slate-600 animate-in fade-in slide-in-from-bottom-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <Network size={14} className="text-amber-600" />
                      </div>
                      <div>
                          <p className="text-slate-600 text-xs">
                            Mengambil data dari <span className="font-semibold text-slate-700">{msg.toolName?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>...
                          </p>
                      </div>
                   </div>
                ) : (
                   // Normal Text
                   <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                     msg.role === 'user' 
                       ? 'bg-white text-slate-800 rounded-tr-none border border-slate-200 shadow-slate-200/50' 
                       : 'bg-white text-slate-800 border-t-4 border-t-teal-500 border-x border-b border-slate-200 rounded-tl-none shadow-slate-200/50'
                   }`}>
                     {msg.content}
                   </div>
                )}
                
                {msg.role !== 'system' && (
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium flex items-center gap-1">
                    {msg.role === 'model' && 'SIMRS-AI • '}
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && !currentTool && (
          <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4 bg-white p-3 pr-6 rounded-full shadow-sm border border-slate-200 ml-12">
               <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                 <Loader2 size={14} className="animate-spin" />
               </div>
               <div className="text-xs font-medium text-slate-500">Menganalisis kebutuhan...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-sm z-10">
        <div className="max-w-4xl mx-auto relative">
            <form onSubmit={handleSendMessage} className="relative flex items-center shadow-lg shadow-slate-200/50 rounded-2xl ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-teal-500 transition-all bg-slate-50 overflow-hidden group">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ketik perintah untuk sistem rumah sakit..."
                    className="flex-1 py-4 pl-5 pr-14 bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm md:text-base"
                    disabled={isLoading}
                />
                <button 
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center w-10 h-10"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </form>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-center">
                <Sparkles size={10} className="text-teal-500" />
                <p className="text-[10px] text-slate-400 font-medium">
                    AI Secure Enclave • Data Pasien Terenkripsi
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};