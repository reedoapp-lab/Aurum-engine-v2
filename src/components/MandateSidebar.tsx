import React from 'react';
import { MandateRecord } from '../types';
import { Building2, Landmark, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MandateSidebarProps {
  mandates: MandateRecord[];
  selectedMandateId: string;
  onSelectMandate: (id: string) => void;
}

export const MandateSidebar: React.FC<MandateSidebarProps> = ({
  mandates,
  selectedMandateId,
  onSelectMandate,
}) => {
  const activeMandate = mandates.find((m) => m.id === selectedMandateId) || mandates[0];

  return (
    <aside className="space-y-6">
      {/* Title & Description */}
      <div className="royal-green-glass p-5 space-y-2">
        <div className="flex items-center gap-2 text-[#F5C542] font-the-seasons font-bold text-base tracking-wider uppercase">
          <Landmark className="w-4 h-4 text-[#F5C542]" />
          <span>Fund Mandate Registry</span>
        </div>
        <p className="text-xs text-[#D1E7DD] leading-relaxed">
          Approved banking coordinates & general ledger accounts for automated wire fraud prevention and DATEV double-entry reconciliation.
        </p>

        {/* Fund Selector Dropdown */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[11px] font-mono-aurum font-semibold text-[#F5E6B8] uppercase tracking-wider block">
            Select Active Mandate Baseline
          </label>
          <select
            value={selectedMandateId}
            onChange={(e) => onSelectMandate(e.target.value)}
            className="w-full bg-[#041A12] border border-[#D4AF37]/40 text-[#F5E6B8] text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5C542] transition font-medium cursor-pointer shadow-inner"
          >
            {mandates.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#06281C] text-white">
                {m.fund_name} ({m.currency})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Mandate Detailed Card */}
      {activeMandate && (
        <div className="royal-green-glass p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono-aurum uppercase font-bold text-[#F5E6B8] tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5C542]/20 border border-[#D4AF37]/40">
                Verified Mandate
              </span>
              <h4 className="text-sm font-bold text-white mt-2 leading-snug font-sans">
                {activeMandate.fund_legal_name}
              </h4>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
          </div>

          <div className="text-xs space-y-1.5 text-[#D1E7DD]">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#F5C542]" />
              <span>GP: <strong className="text-white">{activeMandate.gp_entity}</strong></span>
            </div>
            <div>
              Domicile: <span className="text-white">{activeMandate.domicile}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 space-y-2">
            <div className="text-[10px] uppercase font-mono-aurum font-bold tracking-wider text-[#F5E6B8]">
              Whitelisted IBAN Routing
            </div>
            <div className="font-mono-aurum text-xs text-emerald-300 bg-[#041A12] border border-emerald-400/30 px-3 py-2 rounded-xl break-all select-all font-semibold shadow-inner">
              {activeMandate.iban}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono-aurum">SWIFT / BIC</span>
                <span className="font-mono-aurum text-white font-semibold">{activeMandate.swift_bic}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono-aurum">Custodian</span>
                <span className="text-white font-medium truncate block" title={activeMandate.bank_name}>
                  {activeMandate.bank_name}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] text-[#D1E7DD] font-mono-aurum">
            <span>DATEV SKR03: <strong className="text-[#F5E6B8]">{activeMandate.datev_konto_skr03}</strong></span>
            <span>SKR04: <strong className="text-[#F5E6B8]">{activeMandate.datev_konto_skr04}</strong></span>
          </div>
        </div>
      )}

      {/* Security & Audit Policies */}
      <div className="royal-green-glass p-4 text-xs text-[#D1E7DD] space-y-2">
        <div className="flex items-center gap-2 text-[#F5C542] font-semibold text-[11px] uppercase tracking-wider font-mono-aurum">
          <ShieldAlert className="w-4 h-4 text-[#F5C542]" />
          <span>Sovereign Enforce Rules</span>
        </div>
        <p className="text-[11px] text-[#D1E7DD] leading-relaxed">
          Notices deviating from the approved registry trigger immediate workflow holds, preventing unauthorized wire transfers.
        </p>
      </div>
    </aside>
  );
};
