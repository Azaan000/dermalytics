import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Settings, 
  Key, 
  RotateCcw, 
  Bot, 
  User, 
  Check, 
  Copy, 
  ShieldAlert,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  ExternalLink
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
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **Dermalytics Health Assistant** 😊\n\nI am here to explain skin spots and hair health in **simple, friendly words** that anyone can understand — without complicated medical jargon.\n\nHow can I help you today? Feel free to ask about any mole, hair thinning, or what your scan colors mean!"
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  
  // OpenRouter Settings State
  const [openRouterKey, setOpenRouterKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.5-flash-lite-preview-06-17:free');
  const [config, setConfig] = useState<ChatConfigData | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  // Load saved OpenRouter key and model from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('dermalytics_openrouter_key');
    const savedModel = localStorage.getItem('dermalytics_openrouter_model');
    if (savedKey) setOpenRouterKey(savedKey);
    if (savedModel) setSelectedModel(savedModel);

    // Fetch server chat config
    chatApi.getConfig().then((res) => {
      if (res?.data) {
        setConfig(res.data);
        if (!savedModel && res.data.default_model) {
          setSelectedModel(res.data.default_model);
        }
      }
    }).catch(() => {
      // Fallback config
      setConfig({
        has_server_key: false,
        default_model: 'google/gemini-2.0-flash-001',
        popular_models: [
          { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (Fast & Capable)' },
          { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
          { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Medical Detail)' },
          { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
          { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3' }
        ]
      });
    });
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const cleanKey = (key: string) => {
    let k = key.trim().replace(/^Bearer\s+/i, '');
    return k;
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = cleanKey(openRouterKey);
    setOpenRouterKey(cleaned);
    localStorage.setItem('dermalytics_openrouter_key', cleaned);
    localStorage.setItem('dermalytics_openrouter_model', selectedModel);
    setShowSettings(false);
    showToast('OpenRouter settings saved successfully!', 'success');
  };

  const handleTestKey = async () => {
    const cleaned = cleanKey(openRouterKey);
    if (!cleaned) {
      showToast('Please enter an OpenRouter API key first', 'warning');
      return;
    }
    setIsTestingKey(true);
    try {
      const res = await chatApi.sendMessage(
        [{ role: 'user', content: 'Respond with: "Connection Verified!"' }],
        cleaned,
        selectedModel
      );
      if (res?.data?.is_live_api) {
        showToast('✓ OpenRouter API Key verified successfully!', 'success');
      } else {
        showToast(res?.data?.reply?.substring(0, 80) || 'Check API key credits', 'warning');
      }
    } catch (err: any) {
      showToast('Authentication failed: check your OpenRouter key', 'error');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    const activeKey = cleanKey(openRouterKey);

    try {
      const res = await chatApi.sendMessage(
        updatedMessages,
        activeKey || undefined,
        selectedModel
      );

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
        content: "⚠️ **Notice:** Unable to connect to OpenRouter. Please check your API key and connection in widget settings (⚙️ icon)."
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

  const hasActiveKey = !!cleanKey(openRouterKey);

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
              {hasActiveKey ? 'OpenRouter Connected' : 'Clinical Knowledge Base'}
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
                    {hasActiveKey ? 'OpenRouter' : 'Knowledge Base'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[170px] sm:max-w-[220px]">
                  {hasActiveKey ? `Model: ${selectedModel.split('/')[1] || selectedModel}` : 'Local Clinical Knowledge Manual'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showSettings ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Configure OpenRouter API Key & Model"
              >
                <Settings className="w-4 h-4" />
              </button>
              
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

          {/* Settings Panel Drawer */}
          {showSettings ? (
            <div className="p-5 bg-slate-50 border-b border-slate-200 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Key className="w-4 h-4 text-sky-600" />
                  <span>OpenRouter AI Configuration</span>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                >
                  Back to chat
                </button>
              </div>

              {/* Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs ${
                hasActiveKey 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {hasActiveKey ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>API Key Configured: <code>sk-or-v1-...{openRouterKey.slice(-4)}</code></span>
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>No OpenRouter key entered. Using built-in local knowledge base.</span>
                  </>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Paste OpenRouter API Key</label>
                  <input
                    type="password"
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Do not include quotes or 'Bearer ' prefix</span>
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-sky-600 hover:underline flex items-center space-x-1"
                    >
                      <span>Get a key</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>Select LLM Model</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">⭐ FREE options available</span>
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  >
                    {(() => {
                      const allModels = config?.popular_models || [
                        { id: 'google/gemini-2.5-flash-lite-preview-06-17:free', name: '⭐ Gemini 2.5 Flash Lite (FREE)', is_free: true },
                        { id: 'meta-llama/llama-3.3-70b-instruct:free',          name: '⭐ Llama 3.3 70B Instruct (FREE)', is_free: true },
                        { id: 'deepseek/deepseek-r1-0528:free',                  name: '⭐ DeepSeek R1 (FREE)', is_free: true },
                        { id: 'mistralai/mistral-7b-instruct:free',              name: '⭐ Mistral 7B Instruct (FREE)', is_free: true },
                        { id: 'google/gemini-2.0-flash-001',                     name: 'Gemini 2.0 Flash (Paid)', is_free: false },
                        { id: 'meta-llama/llama-3.3-70b-instruct',              name: 'Llama 3.3 70B (Paid)', is_free: false },
                        { id: 'anthropic/claude-3.5-sonnet',                    name: 'Claude 3.5 Sonnet — Best Medical (Paid)', is_free: false },
                        { id: 'openai/gpt-4o-mini',                             name: 'GPT-4o Mini (Paid)', is_free: false },
                        { id: 'deepseek/deepseek-chat',                         name: 'DeepSeek V3 (Paid)', is_free: false }
                      ];
                      const freeModels = allModels.filter(m => m.is_free);
                      const paidModels = allModels.filter(m => !m.is_free);
                      return (
                        <>
                          <optgroup label="⭐ Free Tier (No Credits Needed)">
                            {freeModels.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="💳 Paid Models">
                            {paidModels.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </optgroup>
                        </>
                      );
                    })()}
                  </select>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    ⭐ Free models work with any OpenRouter account — no credits required.
                  </p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Save Settings
                  </button>
                  
                  {openRouterKey && (
                    <button
                      type="button"
                      onClick={handleTestKey}
                      disabled={isTestingKey}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-all"
                    >
                      {isTestingKey ? 'Testing...' : 'Test Key'}
                    </button>
                  )}

                  {openRouterKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenRouterKey('');
                        localStorage.removeItem('dermalytics_openrouter_key');
                        showToast('OpenRouter key removed. Switched to local knowledge base.', 'info');
                      }}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <>
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
                            className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white border border-slate-200 shadow-sm p-1 rounded-md text-slate-400 hover:text-slate-700 transition-all"
                            title="Copy response"
                          >
                            {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5 shadow-xs">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading indicator bubble */}
                {isLoading && (
                  <div className="flex items-start space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] text-slate-400 font-medium ml-1">Analyzing knowledge base...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 bg-white border-t border-slate-100 flex space-x-1.5 overflow-x-auto no-scrollbar">
                  {QUICK_PROMPTS.slice(0, 3).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-slate-600 rounded-full text-[11px] font-medium border border-slate-200 whitespace-nowrap transition-all flex-shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Bar */}
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
            </>
          )}

        </div>
      )}

    </div>
  );
};
