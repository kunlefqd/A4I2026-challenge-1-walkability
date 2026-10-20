import React, { useState } from 'react';
import { X, Sparkles, Plus, Building, TreePine, ShieldCheck } from 'lucide-react';
import { DALLAS_TRACTS } from '../../data/cityData';

export default function AddSiteModal({ isOpen, onClose, onAddCard }) {
  const [selectedTractId, setSelectedTractId] = useState(DALLAS_TRACTS[0].id);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Resilience Hub');
  const [cost, setCost] = useState('$500,000');
  const [funding, setFunding] = useState('FY2027 Capital Improvement Bond');
  const [columnId, setColumnId] = useState('proposed');

  if (!isOpen) return null;

  const currentTract = DALLAS_TRACTS.find(t => t.id === selectedTractId) || DALLAS_TRACTS[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCard = {
      id: `kb-custom-${Date.now()}`,
      columnId,
      title: title.trim(),
      tractId: currentTract.id,
      tractName: currentTract.name,
      category,
      bqmlRiskScore: currentTract.bqmlRiskScore,
      heatOffset: `+${currentTract.heatOffset}°F`,
      demographics: {
        medianAge: currentTract.demographics.medianAge,
        noVehicleRate: `${currentTract.demographics.noVehicleRate}%`,
        povertyRate: `${currentTract.demographics.povertyRate}%`,
        treeCanopy: `${currentTract.demographics.treeCanopyCover}%`
      },
      estimatedCost: cost,
      fundingSource: funding,
      equityScore: Math.min(99, Math.round(currentTract.bqmlRiskScore * 10)),
      projectedTempReduction: "-4.2°F localized microclimate",
      tags: [category, "Custom Proposal"],
      recommendedBy: "City Manager Custom CIP Submission"
    };

    onAddCard(newCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Propose Resilience Intervention</h3>
              <p className="text-[11px] text-slate-400">Add candidate project to Strategic Planning Kanban</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          
          {/* Target Census Tract */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              TARGET CENSUS TRACT (AUTOMATIC BQML TELEMETRY)
            </label>
            <select
              value={selectedTractId}
              onChange={(e) => setSelectedTractId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
            >
              {DALLAS_TRACTS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (+{t.heatOffset}°F / Risk: {t.bqmlRiskScore})
                </option>
              ))}
            </select>
          </div>

          {/* Auto Demographics Banner */}
          <div className="grid grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono">
            <div>Offset: <b className="text-orange-400">+{currentTract.heatOffset}°F</b></div>
            <div>Zero-Car: <b className="text-purple-300">{currentTract.demographics.noVehicleRate}%</b></div>
            <div>Age &gt;65: <b className="text-amber-300">{currentTract.demographics.seniorRate}%</b></div>
            <div>Canopy: <b className="text-emerald-300">{currentTract.demographics.treeCanopyCover}%</b></div>
          </div>

          {/* Intervention Title */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              PROJECT TITLE & INTERVENTION NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Oak Cliff Community Resilience Center Expansion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Category & Column Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                INTERVENTION CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none font-medium"
              >
                <option value="Resilience Hub">Resilience Hub</option>
                <option value="Pedestrian Shade">Pedestrian Shade</option>
                <option value="Reflective Pavement">Reflective Pavement</option>
                <option value="Urban Forestry">Urban Forestry</option>
                <option value="Emergency Hydration">Emergency Hydration</option>
                <option value="Cool Roofs">Cool Roofs</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                KANBAN STAGE
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none font-medium"
              >
                <option value="backlog">Backlog</option>
                <option value="proposed">Proposed Sites</option>
                <option value="council">Council Review</option>
                <option value="approved">Approved / Funded</option>
              </select>
            </div>
          </div>

          {/* Cost & Funding */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                ESTIMATED CAPITAL COST
              </label>
              <input
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="$450,000"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                FUNDING MECHANISM
              </label>
              <input
                type="text"
                value={funding}
                onChange={(e) => setFunding(e.target.value)}
                placeholder="Bond Prop / BRIC Grant"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-950/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Proposal Card</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
