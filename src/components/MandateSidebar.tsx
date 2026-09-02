import React, { useState } from 'react';
import { Landmark, CheckCircle2, ShieldAlert, KeyRound, Copy, Check } from 'lucide-react';

export interface FundMandate {
  name: string;
  iban: string;
}

export const KNOWN_FUNDS_REGISTRY: { [key: string]: string } = {
  "EQT Infrastructure V": "LU12345678901234567890",
  "Sequoia Capital US Growth": "US33CITI12345678901234",
  "Nordic Capital X": "SE45500000000583982455",
  "Alpha Buyout Fund IV": "DE89370400440532013000",
  "Custom Mandate": "CUSTOM",
};

interface MandateSidebarProps {
  selectedFund: string;
  onSelectFund: (fundName: string, iban: string) => void;
  expectedIban: string;
}

export const MandateSidebar: React.FC<MandateSidebarProps> = ({
  selectedFund,
  onSelectFund,
  expectedIban,
}) => {
  const [customIban, setCustomIban] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const fundKeys = Object.keys(KNOWN_FUNDS_REGISTRY);

  const handleFundChange = (fundName: string) => {
    if (fundName === 'Custom Mandate') {
      onSelectFund(fundName, customIban || 'LU12345678901234567890');
    } else {
      const iban = KNOWN_FUNDS_REGISTRY[fundName] || '';
      onSelectFund(fundName, iban);
    }
  };

  const handleCustomIbanChange = (val: string) => {
    setCustomIban(val);
    onSelectFund('Custom Mandate', val);
  };

  const handleCopyIban = () => {
    if (expectedIban) {
      navigator.clipboard.writeText(expectedIban);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Mandate Registry Header */}
      <div className="royal-green-glass p-5 space-y-3">
        <div className="flex items-center gap-2 text-[#F5C542] font-bold text-base tracking-wider uppercase font-mono-aurum">
          <Landmark className="w-4 h-4 text-[#F5C542]" />
          <span>Fund Mandate Registry</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Approved wiring instructions for verification checks.
        </p>

        {/* Registered Fund Selector */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[11px] font-mono-aurum font-semibold text-[#F5E6B8] uppercase tracking-wider block">
            Registered Fund
          </label>
          <select
            value={selectedFund}
            onChange={(e) => handleFundChange(e.target.value)}
            className="w-full bg-[#041A12] border border-[#D4AF37]/40 text-[#F5E6B8] text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#F5C542] transition font-medium cursor-pointer shadow-inner"
          >
            {fundKeys.map((fund) => (
              <option key={fund} value={fund} className="bg-[#06281C] text-white">
                {fund}
              </option>
            ))}
          </select>
        </div>

        {/* Custom IBAN field if Custom Mandate selected */}
        {selectedFund === 'Custom Mandate' && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-mono-aurum text-slate-300 uppercase">
              Custom Whitelisted IBAN
            </label>
            <input
              type="text"
              placeholder="e.g. DE89370400440532013000"
              value={customIban}
              onChange={(e) => handleCustomIbanChange(e.target.value)}
              className="w-full bg-[#041A12] border border-white/20 text-emerald-300 text-xs font-mono-aurum rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5C542]"
            />
          </div>
        )}

        {/* Approved IBAN Code Display */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono-aurum text-slate-300">
            <span>Approved Baseline Mandate</span>
            <button
              onClick={handleCopyIban}
              className="text-[#F5C542] hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="bg-[#041A12] border border-[#D4AF37]/30 rounded-xl p-3 font-mono-aurum text-xs shadow-inner">
            <div className="text-[10px] text-slate-400 font-sans">Approved IBAN:</div>
            <div className="text-emerald-300 font-bold tracking-wider mt-0.5 break-all select-all">
              {expectedIban || 'No IBAN Registered'}
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Verification Shield Policy */}
      <div className="royal-green-glass p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-[#F5C542] font-semibold text-[11px] uppercase tracking-wider font-mono-aurum">
          <ShieldAlert className="w-4 h-4 text-[#F5C542]" />
          <span>Anti-Fraud Wire Policy</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
          Incoming capital call notice bank coordinates are strictly verified against approved baseline mandates before wire authorization.
        </p>
      </div>
    </aside>
  );
};
