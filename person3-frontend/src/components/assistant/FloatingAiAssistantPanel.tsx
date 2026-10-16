import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  Droplets,
  Zap,
  Info,
  Maximize2,
  Minimize2,
  HelpCircle,
  CornerDownLeft
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface AssistantMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  isAlert?: boolean;
  alertType?: 'contamination' | 'hazard' | 'tip';
}

const INITIAL_MESSAGES: AssistantMessage[] = [
  {
    id: 'msg-alert-1',
    sender: 'system',
    text: '⚠️ Contamination Alert: Residual liquids detected in Bin B. Rinse containers to earn +10 bonus pts.',
    timestamp: '2 mins ago',
    isAlert: true,
    alertType: 'contamination'
  },
  {
    id: 'msg-intro',
    sender: 'ai',
    text: 'Hi! I am your SmartRecycle AI Assistant. Ask me anything about material classification, hazardous battery protocols, or curbside stream rules!',
    timestamp: 'Just now'
  }
];

const QUICK_PROMPTS = [
  'How do I dispose of a swollen lithium battery?',
  'Can greasy pizza boxes be recycled?',
  'How to recycle Tetra Pak cartons with plastic spouts?',
  'What items are accepted in curbside blue bin?'
];

const KNOWLEDGE_BASE: Record<string, string> = {
  'battery': 'Lithium-ion batteries are hazardous and cause truck fires. Tape exposed terminals with electrical tape and drop them off at a designated e-waste kiosk (like Best Buy, Home Depot, or certified municipal collection centres). NEVER discard in household trash.',
  'pizza': 'Only clean, grease-free cardboard lids can be recycled in paper streams. Greasy, cheese-stained cardboard ruined paper pulping—tear off the greasy base for compost or general waste, and recycle the clean top!',
  'tetra': 'Tetra Pak cartons are multi-material composites (75% paperboard, 20% polymer, 5% aluminum). Remove the plastic screw cap to recycle with plastics, rinse the carton, and flatten it for the beverage carton recycling stream.',
  'curbside': 'Accepted curbside blue bin items: Clean PET #1 & HDPE #2 bottles, aluminum cans, flattened cardboard, clean paper, and tin cans. Items NOT accepted: Plastic bags, garden hoses, lightbulbs, batteries, and food-stained containers.',
  'rinse': 'Containers only need a quick 5-second cold water rinse. Thorough washing with hot water and soap wastes more energy than recycling saves. Empty all liquids completely!',
  'chemical': 'Hazardous chemical containers (paint, pesticides, motor oil, bleach) must never be rinsed into city drains. Take them directly to your municipal Household Hazardous Waste (HHW) depot with labels intact.'
};

export const FloatingAiAssistantPanel: React.FC = () => {
  const { currentColor } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "I've analyzed your question. For general household items, ensure containers are empty and dry. Place clean plastics #1 and #2, paper, and metal cans into recycling. Use the AI Camera scanner to classify uncertain packaging!";

      if (lower.includes('battery') || lower.includes('cell') || lower.includes('lithium')) {
        reply = KNOWLEDGE_BASE['battery'];
      } else if (lower.includes('pizza') || lower.includes('grease') || lower.includes('oil')) {
        reply = KNOWLEDGE_BASE['pizza'];
      } else if (lower.includes('tetra') || lower.includes('carton') || lower.includes('spout') || lower.includes('composite')) {
        reply = KNOWLEDGE_BASE['tetra'];
      } else if (lower.includes('curbside') || lower.includes('blue bin') || lower.includes('what can')) {
        reply = KNOWLEDGE_BASE['curbside'];
      } else if (lower.includes('rinse') || lower.includes('clean') || lower.includes('wash') || lower.includes('residue')) {
        reply = KNOWLEDGE_BASE['rinse'];
      } else if (lower.includes('chemical') || lower.includes('paint') || lower.includes('toxic') || lower.includes('hazardous')) {
        reply = KNOWLEDGE_BASE['chemical'];
      }

      const aiMsg: AssistantMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now'
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Launcher Pill when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#111827]/95 backdrop-blur-xl border border-white/15 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          style={{ boxShadow: `0 10px 25px -5px ${currentColor.hex}40` }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md animate-ring-pulse"
            style={{ backgroundColor: currentColor.hex }}
          >
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold tracking-tight">EcoBot AI</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Expanded Floating Assistant Card */}
      {isOpen && (
        <div
          className={`glass-card rounded-2xl border border-white/15 shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
            isMinimized
              ? 'w-72 sm:w-80 h-14'
              : 'w-[calc(100vw-2.5rem)] sm:w-96 max-h-[520px] h-[500px]'
          }`}
        >
          {/* Header */}
          <div
            className="p-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/90"
            style={{ borderTop: `2px solid ${currentColor.hex}` }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: currentColor.hex }}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-tight">EcoBot AI Assistant</h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">Real-time alerts &amp; sorting guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs bg-slate-950/40">
                {messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div
                        key={msg.id}
                        className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 space-y-1 animate-slide-in"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Realtime Alert</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-100">{msg.text}</p>
                      </div>
                    );
                  }

                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-500 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-1 text-gray-400 text-xs p-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200" />
                    <span className="text-[10px] ml-1">Analyzing disposal guidelines...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div className="p-2 bg-slate-900/80 border-t border-white/5 shrink-0 overflow-x-auto">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar */}
              <div className="p-2.5 bg-slate-900/90 border-t border-white/10 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask EcoBot: e.g. How to dispose of batteries?"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="p-2 rounded-xl text-white shadow-md disabled:opacity-40 hover:brightness-110 transition-all"
                    style={{ backgroundColor: currentColor.hex }}
                  >
                    <Send className="w-3.5 h-3.5" />
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
