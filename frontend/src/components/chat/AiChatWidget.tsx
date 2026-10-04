import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  Copy, 
  ShieldAlert,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { chatApi, ChatMessage, ChatConfigData } from '../../api/chat';
import { useToast } from '../../context/ToastContext';

const QUICK_PROMPTS = [
  "🔬 How can I spot a dangerous skin spot (Melanoma)?",
  "💈 How does the AI measure hair loss and fullness?",
  "🧠 What do the red and blue colors mean on my photo?",
  "📋 What are the 5 ABCDE signs of an unusual mole?",
  "🧪 What are the 7 types of skin spots in simple words?"
];

export const AiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **Dermalytics Health Assistant** 😊\n\nI am here to explain skin spots and hair health in **simple, friendly words** that anyone can understand — without complicated medical jargon.\n\nHow can I help you today? Feel free to ask about any mole, hair thinning, or what your scan colors mean!"
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [config, setConfig] = useState<ChatConfigData | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  // Fetch server chat config to know if backend has an active live AI key configured in .env
  useEffect(() => {
    chatApi.getConfig().then((res) => {
      if (res?.data) {
        setConfig(res.data);
      }
    }).catch(() => {
      setConfig({
        has_server_key: false,
        default_model: 'openrouter/free',
        popular_models: []
      });
    });
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage(updatedMessages);

      if (res?.data?.reply) {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: res.data.reply
        };
        setMessages([...updatedMessages, assistantMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: "⚠️ **Notice:** Unable to connect to server chat service. Please check your backend connection."
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared. Feel free to ask any question regarding skin lesions, hair & scalp conditions, or Grad-CAM saliency!"
      }
    ]);
    showToast('Chat history cleared', 'info');
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    showToast('Message copied to clipboard', 'info');
  };

  // Simple clean markdown formatter
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-extrabold text-base text-slate-900 mt-2.5 mb-1.5">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-black text-lg text-slate-900 mt-3 mb-1.5">{line.replace('## ', '')}</h3>;
      }
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const clean = line.trim().substring(2);
        return (
          <li key={idx} className="ml-3.5 list-disc text-sm leading-relaxed my-1 text-slate-800">
            {renderInlineMarkdown(clean)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-sm leading-relaxed text-slate-800">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 bg-slate-100 text-sky-700 rounded text-xs font-mono font-semibold">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const hasActiveKey = !!config?.has_server_key;

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center space-x-2.5 bg-gradient-to-r from-sky-600 via-sky-700 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-sky-500/30 hover:scale-105 transition-all duration-300 border border-white/20"
          title="Open Dermalytics AI Knowledge Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-slate-900 rounded-full animate-pulse ${hasActiveKey ? 'bg-emerald-400' : 'bg-sky-400'}`} />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-black tracking-wide block">Dermalytics AI</span>
            <span className="text-[10px] text-sky-100 font-medium block">
              {hasActiveKey ? 'Server AI Connected' : 'Clinical Knowledge Base'}
            </span>
          </div>
        </button>
      )}

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div 
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-all duration-300 backdrop-blur-md animate-scaleUp ${
            isExpanded 
              ? 'w-[94vw] sm:w-[620px] h-[85vh] max-h-[780px]' 
              : 'w-[92vw] sm:w-[410px] h-[580px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight">Dermalytics AI</h3>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    hasActiveKey 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                      : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                  }`}>
                    {hasActiveKey ? 'Live AI' : 'Offline KB'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[170px] sm:max-w-[220px]">
                  {hasActiveKey ? 'Server Model Active' : 'Certified Clinical Knowledge'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Thread Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            
            {/* Clinical Disclaimer Tag */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center space-x-2 text-[10px] text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Grounded in Dermalytics Clinical Knowledge Base. For preliminary education only.</span>
            </div>

            {/* Messages List */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={idx} 
                  className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div 
                    className={`group relative max-w-[84%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser 
                        ? 'bg-sky-600 text-white rounded-tr-xs' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <div className="space-y-1">
                      {renderFormattedText(msg.content)}
                    </div>

                    {/* Copy button for assistant responses */}
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.content, idx)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 text-[10px]"
                        title="Copy text"
                      >
                        {copiedIndex === idx ? 'Copied!' : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 pl-2">
                <div className="w-5 h-5 rounded-full border-2 border-sky-600 border-t-transparent animate-spin" />
                <span className="font-medium animate-pulse">Consulting knowledge base...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 overflow-x-auto no-scrollbar flex space-x-2">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all shadow-2xs disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Controls */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about skin spots, hair loss, Grad-CAM..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`p-2.5 rounded-2xl transition-all shadow-sm ${
                  inputText.trim() && !isLoading
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 scale-105'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
