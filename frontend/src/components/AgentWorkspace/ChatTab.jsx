import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Building2, 
  Flame, 
  Scale, 
  Plus, 
  Truck, 
  MapPin, 
  ArrowUpRight,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { SUGGESTED_PROMPT_CHIPS, getAgentResponse } from '../../data/aiKnowledge';
import { requestAgentResponse } from '../../services/agent';

export default function ChatTab({
  chatMessages,
  setChatMessages,
  onSelectTractById,
  onDeployTruck,
  onAddToKanban,
  selectedTract
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
      structuredData: null
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const agentPayload = await requestAgentResponse({ query, selectedTract });
      const response = agentPayload || getAgentResponse(query, selectedTract);
      const agentMsg = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: response.content,
        structuredType: response.structuredType,
        cards: response.cards,
        equityMetrics: response.equityMetrics,
        tract: response.tract
      };

      setChatMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      const response = getAgentResponse(query, selectedTract);
      const agentMsg = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: response.content,
        structuredType: response.structuredType,
        cards: response.cards,
        equityMetrics: response.equityMetrics,
        tract: response.tract
      };
      setChatMessages(prev => [...prev, agentMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChipClick = (chipQuery) => {
    handleSend(chipQuery);
  };

  // Helper to render markdown bold, headers, and bullet lines
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-bold text-slate-100 mt-2 mb-1 text-orange-300">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-xs font-semibold text-slate-200 mt-2 mb-0.5 text-amber-200">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('- ', '')) }} />
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-decimal my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\.\s/, '')) }} />
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-300 my-0.5 leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900/60">
      
      {/* Prompt Suggestion Chips */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Suggested Inquiries for City Manager:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.query)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-orange-500/50 text-slate-200 hover:text-white text-xs font-medium transition-all shadow-sm text-left group"
            >
              <span className="text-orange-400 group-hover:scale-110 transition-transform">
                {chip.icon === 'Building2' && <Building2 className="w-3.5 h-3.5" />}
                {chip.icon === 'Flame' && <Flame className="w-3.5 h-3.5" />}
                {chip.icon === 'Scale' && <Scale className="w-3.5 h-3.5" />}
                {chip.icon === 'Sparkles' && <Sparkles className="w-3.5 h-3.5" />}
              </span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Agent Avatar */}
            {msg.sender === 'agent' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-950/50">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            {/* Message Bubble */}
            <div className={`max-w-[88%] rounded-2xl p-3.5 ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-tr-none shadow-md'
                : 'glass-panel rounded-tl-none border border-slate-800 shadow-lg text-slate-100'
            }`}>
              
              {/* Header meta */}
              <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] text-slate-400 font-mono">
                <span className={msg.sender === 'user' ? 'text-orange-200 font-bold' : 'text-orange-400 font-bold'}>
                  {msg.sender === 'user' ? 'City Operations Director' : 'SHADE (Gemini 3.8)'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message text content */}
              <div className="space-y-1">
                {renderFormattedText(msg.content)}
              </div>

              {/* Structured Output 1: Recommendation Cards */}
              {msg.cards && (
                <div className="mt-3.5 space-y-2.5">
                  <div className="text-[11px] font-mono text-orange-400 uppercase tracking-wider font-bold">
                    Algorithmic Placement Results:
                  </div>
                  {msg.cards.map((card) => (
                    <div 
                      key={card.id}
                      className="bg-slate-900/90 border border-slate-700/80 hover:border-orange-500/50 rounded-xl p-3 shadow-md space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold flex items-center justify-center font-mono">
                            #{card.rank}
                          </span>
                          <span className="text-xs font-bold text-white">{card.tractName}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          {card.bqmlHeatOffset}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 italic">
                        {card.locationDetails}
                      </p>

                      {/* Demographics mini-grid */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-2 rounded-lg text-[10px] font-mono text-slate-300">
                        <div>Zero-Car: <b className="text-purple-300">{card.demographics.zeroVehicle}</b></div>
                        <div>Seniors: <b className="text-amber-300">{card.demographics.seniors}</b></div>
                        <div>Canopy: <b className="text-emerald-300">{card.demographics.canopyCover}</b></div>
                      </div>

                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-400">Strategy:</span> <strong className="text-slate-100">{card.recommendedType}</strong>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
                        <button
                          onClick={() => onAddToKanban({
                            id: `kb-ai-${card.rank}`,
                            title: `${card.tractName} Cooling Center`,
                            tractId: card.tractId,
                            tractName: card.tractName,
                            category: "Resilience Hub",
                            bqmlRiskScore: card.riskScore,
                            heatOffset: card.bqmlHeatOffset,
                            demographics: {
                              noVehicleRate: card.demographics.zeroVehicle,
                              medianAge: 42,
                              povertyRate: card.demographics.poverty,
                              treeCanopy: card.demographics.canopyCover
                            },
                            estimatedCost: card.estCost,
                            fundingSource: card.fundingOption,
                            equityScore: 97
                          })}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-semibold transition-colors shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add to Kanban</span>
                        </button>

                        <button
                          onClick={() => onDeployTruck({
                            id: card.tractId,
                            name: card.tractName,
                            surfaceTemp: 134,
                            heatOffset: 9.8
                          })}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-600/80 hover:bg-orange-600 text-white text-[11px] font-semibold transition-colors shadow-sm"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Deploy Resource</span>
                        </button>

                        <button
                          onClick={() => onSelectTractById(card.tractId)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors ml-auto"
                        >
                          <MapPin className="w-3 h-3 text-orange-400" />
                          <span>Locate</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* Structured Output 2: Equity Audit Table */}
              {msg.equityMetrics && (
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Title VI Equity Disparity Matrix:</span>
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/70">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-mono text-[10px]">
                        <tr>
                          <th className="p-2">Tract / Corridor</th>
                          <th className="p-2">Heat Offset</th>
                          <th className="p-2">Poverty</th>
                          <th className="p-2">No Car</th>
                          <th className="p-2">Equity Index</th>
                          <th className="p-2">Compliance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {msg.equityMetrics.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/40">
                            <td className="p-2 font-medium text-white">{row.tractName}</td>
                            <td className="p-2 font-mono text-orange-400">{row.heatOffset}</td>
                            <td className="p-2 text-slate-300">{row.povertyRate}</td>
                            <td className="p-2 text-purple-300 font-semibold">{row.noVehicle}</td>
                            <td className="p-2 font-mono font-bold text-emerald-400">{row.equityIndex}/100</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${row.statusBadge}`}>
                                {row.complianceStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200">
                    ✓ <strong>Equity Finding:</strong> Priority allocation to 63rd & Halsted and North Lawndale satisfies Federal Justice40 initiatives and CDC SVI vulnerability screening, and unlocks Title VI federal matching funds.
                  </div>
                </div>
              )}

            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-4 h-4 text-orange-400" />
              </div>
            )}
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-orange-600/80 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="glass-panel rounded-2xl rounded-tl-none p-3 border border-slate-800 flex items-center gap-1.5 text-xs text-orange-300">
              <span className="font-mono text-[11px]">BigQuery ML evaluating spatial telemetry</span>
              <span className="inline-flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chat-input-query"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Copilot: cooling placement, heat disparity, cool roofs..."
            className="flex-1 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-white shadow-md shadow-orange-950/50 transition-all flex-shrink-0"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
