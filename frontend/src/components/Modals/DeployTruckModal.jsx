import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Droplet, 
  Wind, 
  Users, 
  MapPin,
  Sparkles 
} from 'lucide-react';

export default function DeployTruckModal({
  isOpen,
  onClose,
  targetAlert,
  targetTract,
  onConfirmDispatch
}) {
  const [resourceType, setResourceType] = useState('Mobile Hydration Bus (40-Seat Misting)');
  const [driverOfficer, setDriverOfficer] = useState('Engine 14 / Officer J. Delgado');
  const [cargoWater, setCargoWater] = useState('2,400 chilled bottles + electrolyte packs');
  const [mistingUnits, setMistingUnits] = useState('4 high-velocity misting fans');
  const [etaMinutes, setEtaMinutes] = useState(12);

  if (!isOpen) return null;

  const tractName = targetAlert?.tractName || targetTract?.name || "Chicago Heat Corridor";
  const tractId = targetAlert?.tractId || targetTract?.id || "tract-0089";

  const handleDispatch = (e) => {
    e.preventDefault();
    onConfirmDispatch({
      action: `Dispatched ${resourceType}`,
      tractId,
      location: tractName,
      actor: `Operations Command (${driverOfficer})`,
      timestamp: `Just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      equityResult: "PASSED (Score: 99/100)",
      equityDetails: `Automated Equity Verification: Priority dispatched to high-vulnerability tract with 41.5% zero-vehicle and >130°F surface temperature.`,
      status: "En Route (ETA 12 mins)",
      impact: `Supplying ${cargoWater} and ${mistingUnits}.`
    }, targetAlert?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-orange-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Truck className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Emergency Resource Dispatch</h3>
              <p className="text-[11px] text-slate-400">SHADE Rapid Response Command</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target destination banner */}
        <div className="bg-orange-950/30 border-b border-orange-500/20 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-orange-300 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>Target: {tractName}</span>
          </div>
          <span className="font-mono text-[11px] text-orange-400 font-bold bg-orange-900/50 px-2 py-0.5 rounded border border-orange-700/50">
            ETA: ~12 Mins
          </span>
        </div>

        {/* Dispatch Form */}
        <form onSubmit={handleDispatch} className="p-4 space-y-3.5 text-xs">
          
          {/* Resource Selection */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              RESOURCE UNIT TYPE
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            >
              <option value="Mobile Hydration Bus (40-Seat Misting)">
                Mobile Hydration Bus (40-Seat Air-Conditioned + Misting)
              </option>
              <option value="10,000L Auxiliary Water Tender">
                10,000L Auxiliary Water Tender (Bulk Supply)
              </option>
              <option value="Rapid Shade Trailer & Misting Arc Unit">
                Rapid Shade Trailer & Misting Arc Unit (80 Person Capacity)
              </option>
              <option value="Paramedic Heat Stroke Triage Van">
                Paramedic Heat Stroke Triage Van (EMS Advanced Support)
              </option>
            </select>
          </div>

          {/* Assigned Unit & Driver */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                ASSIGNED CREW / UNIT
              </label>
              <input
                type="text"
                value={driverOfficer}
                onChange={(e) => setDriverOfficer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                WATER & ELECTROLYTE CARGO
              </label>
              <input
                type="text"
                value={cargoWater}
                onChange={(e) => setCargoWater(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Automated Title VI Verification Banner */}
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated Title VI Equity Verification</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Target census tract qualifies for rapid emergency relief under Municipal Heat Action Plan Section 4.2. Action will be automatically logged to the city public audit ledger.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-semibold shadow-lg shadow-orange-950/60 transition-transform active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>Confirm & Dispatch Truck</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
