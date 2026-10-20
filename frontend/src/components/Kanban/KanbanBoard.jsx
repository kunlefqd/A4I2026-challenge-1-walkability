import React, { useState } from 'react';
import { 
  INITIAL_KANBAN_COLUMNS 
} from '../../data/initialKanban';
import KanbanCard from './KanbanCard';
import AddSiteModal from './AddSiteModal';
import { 
  Plus, 
  Layers, 
  FileSpreadsheet, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Map as MapIcon, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KanbanBoard({
  cards,
  setCards,
  onSwitchToMap,
  onSelectTractById
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reportExported, setReportExported] = useState(false);

  const columnOrder = ['backlog', 'proposed', 'council', 'approved'];

  const handleMoveCard = (cardId, delta) => {
    setCards(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      const currentIndex = columnOrder.indexOf(card.columnId);
      const nextIndex = Math.min(Math.max(currentIndex + delta, 0), columnOrder.length - 1);
      const nextColumnId = columnOrder[nextIndex];

      // If moved to approved, fire confetti!
      if (nextColumnId === 'approved' && card.columnId !== 'approved') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas-confetti is not loaded
        }
      }

      return {
        ...card,
        columnId: nextColumnId
      };
    }));
  };

  const handleAddCard = (newCard) => {
    setCards(prev => [newCard, ...prev]);
  };

  const handleDeleteCard = (cardId) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  };

  // Pipeline summary statistics
  const approvedCount = cards.filter(c => c.columnId === 'approved').length;
  const councilCount = cards.filter(c => c.columnId === 'council').length;
  const proposedCount = cards.filter(c => c.columnId === 'proposed').length;

  return (
    <div className="flex flex-col flex-1 min-h-[640px] p-4 lg:p-6 space-y-4 max-w-7xl mx-auto w-full">
      
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Strategic Planning Kanban Board
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              FY2027 Capital Improvement Program
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Prioritize municipal cooling shelters, cool pavement, and shade networks backed by BigQuery ML risk attribution.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => {
              setReportExported(true);
              setTimeout(() => setReportExported(false), 3000);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{reportExported ? "✓ CIP Brief Exported" : "Council CIP Export"}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-950/50 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Propose New Intervention</span>
          </button>

          <button
            onClick={onSwitchToMap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600/80 hover:bg-orange-600 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map & Spatial</span>
          </button>

        </div>

      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Total Capital Pipeline</span>
          <div className="text-base font-bold text-white font-mono mt-0.5">$5,245,000</div>
          <span className="text-[10px] text-emerald-400">8 Identified Capital Sites</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Council Review Queue</span>
          <div className="text-base font-bold text-purple-300 font-mono mt-0.5">{councilCount} Proposals</div>
          <span className="text-[10px] text-slate-400">Next Hearing: July 28</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Approved & Funded</span>
          <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{approvedCount} Projects</div>
          <span className="text-[10px] text-emerald-300">Bond Prop D & CDBG</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Title VI Equity Average</span>
          <div className="text-base font-bold text-amber-300 font-mono mt-0.5">93.4 / 100</div>
          <span className="text-[10px] text-emerald-400">Justice40 Compliant</span>
        </div>
      </div>

      {/* 4 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 items-start">
        {INITIAL_KANBAN_COLUMNS.map((column) => {
          const columnCards = cards.filter(c => c.columnId === column.id);

          return (
            <div 
              key={column.id}
              className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col gap-3 min-h-[500px] shadow-inner"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    {column.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${column.badgeColor}`}>
                    {columnCards.length}
                  </span>
                </div>

                {column.id === 'proposed' && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Add site"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnCards.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-800/60 rounded-xl text-slate-500 text-xs font-mono">
                    Empty column
                  </div>
                ) : (
                  columnCards.map((card) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      onMoveCard={handleMoveCard}
                      onDeleteCard={handleDeleteCard}
                      onSelectTractById={onSelectTractById}
                    />
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Custom Intervention Modal */}
      <AddSiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCard={handleAddCard}
      />

    </div>
  );
}
