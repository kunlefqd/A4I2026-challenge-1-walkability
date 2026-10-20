import React from 'react';
import { 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  DollarSign, 
  ShieldCheck, 
  Thermometer, 
  Flame, 
  Users, 
  TreePine,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function KanbanCard({
  card,
  onMoveCard,
  onDeleteCard,
  onSelectTractById
}) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-lg space-y-3 transition-all hover:shadow-xl group">
      
      {/* Top row: Category tag & BQML Risk Score */}
      <div className="flex items-start justify-between gap-2">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          {card.category}
        </span>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[10px] text-slate-400">BQML:</span>
          <span className="font-bold text-orange-400">{card.heatOffset}</span>
          <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
            {card.bqmlRiskScore}
          </span>
        </div>
      </div>

      {/* Card Title & Location */}
      <div>
        <h4 className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors leading-snug">
          {card.title}
        </h4>
        <button
          onClick={() => card.tractId && onSelectTractById(card.tractId)}
          className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline flex items-center gap-1 mt-0.5 text-left"
        >
          <span>📍 {card.tractName}</span>
        </button>
      </div>

      {/* Demographic Data Badges */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-950/70 p-2 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800/80">
        <div>No-Vehicle: <b className="text-purple-300">{card.demographics.noVehicleRate}</b></div>
        <div>Median Age: <b className="text-amber-300">{card.demographics.medianAge}</b></div>
        <div>Poverty: <b className="text-slate-200">{card.demographics.povertyRate}</b></div>
        <div>Canopy: <b className="text-emerald-300">{card.demographics.treeCanopy}</b></div>
      </div>

      {/* Financials & Equity Score */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-slate-800/80 pt-2 font-mono">
        <div>
          <span className="text-slate-500">Est:</span> <b className="text-emerald-400">{card.estimatedCost}</b>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Equity:</span>
          <b className="text-emerald-400">{card.equityScore}/100</b>
        </div>
      </div>

      {/* Projected Reduction */}
      {card.projectedTempReduction && (
        <div className="text-[10px] text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 px-2 py-1 rounded">
          Impact: {card.projectedTempReduction}
        </div>
      )}

      {/* Column Transition Controls */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800">
        
        {/* Move Left */}
        {card.columnId !== 'backlog' ? (
          <button
            onClick={() => onMoveCard(card.id, -1)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Move back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        ) : <div />}

        {/* Source / Delete */}
        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
          {card.fundingSource}
        </div>

        {/* Move Right */}
        {card.columnId !== 'approved' ? (
          <button
            onClick={() => onMoveCard(card.id, 1)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
            title="Advance stage"
          >
            <span>Advance</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Funded</span>
          </span>
        )}

      </div>

    </div>
  );
}
