import React from 'react';
import { ShieldCheck, Lock, Award, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onOpenInfoModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="border-b border-[#D4AF37]/30 bg-[#06281C]/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_4px_25px_rgba(6,40,28,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Engine Version */}
        <div className="flex items-center gap-3.5">
          <img
            src="https://lh3.googleusercontent.com/d/12qLE1pfcALKFv3etXm0BxtiWYcT9U096"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/aurum-logo.png';
            }}
            alt="Aurum Ledger"
            className="h-10 sm:h-12 w-auto object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F5C542]/20 border border-[#D4AF37]/50 text-[#F5E6B8] text-[10px] font-mono-aurum font-bold px-2.5 py-0.5 rounded-full tracking-widest uppercase shadow-sm">
                ENGINE v2.4
              </span>
            </div>
            <p className="text-[11px] text-[#D1E7DD] font-medium tracking-wide mt-0.5">
              Sovereign Operating System for Capital Call Auditing & General Ledger Verification
            </p>
          </div>
        </div>

        {/* Security & System Status Badges */}
        <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono-aurum">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#041A12] border border-[#D4AF37]/30 text-[#F5E6B8]">
            <Lock className="w-3.5 h-3.5 text-[#F5C542]" />
            <span>ISO 7064 Modulo-97 Guard</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/40 border border-emerald-400/40 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DATEV SKR03/04 Active</span>
          </div>

          <a
            href="https://www.aurumledger.eu/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/60 text-[#FFE082] transition"
          >
            <span>aurumledger.eu</span>
            <ExternalLink className="w-3 h-3 text-[#F5C542]" />
          </a>
        </div>
      </div>
    </header>
  );
};
