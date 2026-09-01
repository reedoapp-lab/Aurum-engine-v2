import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AuditResult, NoticeExtraction, MandateRecord } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertOctagon, ArrowRight, Download, X } from 'lucide-react';

interface PassFailModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: AuditResult;
  data: NoticeExtraction;
  mandate?: MandateRecord | null;
  onViewCertificate?: () => void;
}

export const PassFailModal: React.FC<PassFailModalProps> = ({
  isOpen,
  onClose,
  audit,
  data,
  mandate,
  onViewCertificate,
}) => {
  const isPass = audit.math_passed && audit.wire_passed;

  useEffect(() => {
    if (isOpen && isPass) {
      // Trigger royal gold & emerald confetti burst
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F5C542', '#D4AF37', '#10B981', '#06281C', '#FFFFFF'],
        ticks: 250,
      });
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#F5C542', '#D4AF37', '#34D399'],
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#F5C542', '#D4AF37', '#34D399'],
        });
      }, 250);
    }
  }, [isOpen, isPass]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border text-slate-100 transition-all transform animate-scaleUp overflow-hidden ${
          isPass
            ? 'bg-gradient-to-b from-[#082A1D] via-[#062016] to-[#04160F] border-[#D4AF37]/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
            : 'bg-gradient-to-b from-[#2B1015] via-[#1A0B0E] to-[#120709] border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)]'
        }`}
      >
        {/* Decorative Background Aura */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-25 ${
            isPass ? 'bg-[#D4AF37]' : 'bg-rose-600'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon Animation */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-transform duration-700 ${
                isPass
                  ? 'bg-emerald-950/70 border-[#D4AF37] text-[#F5C542] shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-bounce-short'
                  : 'bg-rose-950/70 border-rose-500 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-pulse'
              }`}
            >
              {isPass ? (
                <ShieldCheck className="w-13 h-13 text-[#F5C542]" />
              ) : (
                <ShieldAlert className="w-13 h-13 text-rose-400" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-mono-aurum font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  isPass
                    ? 'bg-emerald-500/20 text-[#F5E6B8] border-[#D4AF37]/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {isPass ? 'SOVEREIGN CERTIFICATION' : 'FORENSIC ALERT'}
              </span>
            </div>

            <h2 className="font-the-seasons text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isPass
                ? 'Capital Call Audit Passed'
                : 'Discrepancy Detected — Hold Wire'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
              {isPass
                ? `Extraction verified against ${mandate?.fund_name || data.fund_name}. All component math sums precisely and banking coordinates match whitelist baseline.`
                : 'Wire instructions or call balance figures deviate from the authorized institutional mandate. Secondary CFO signoff required.'}
            </p>
          </div>

          {/* Key Metrics Grid in Modal */}
          <div className="w-full grid grid-cols-2 gap-3 pt-2 text-left">
            <div className="bg-black/30 border border-white/10 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono-aurum">
                Arithmetic Math
              </div>
              <div
                className={`text-sm font-bold font-mono-aurum mt-0.5 flex items-center gap-1 ${
                  audit.math_passed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {audit.math_passed ? '✓ 0.00 Variance' : `✗ Diff: ${audit.discrepancy_amount.toFixed(2)}`}
              </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono-aurum">
                Modulo-97 & Whitelist
              </div>
              <div
                className={`text-sm font-bold font-mono-aurum mt-0.5 flex items-center gap-1 ${
                  audit.wire_passed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {audit.wire_passed ? '✓ Whitelisted & Valid' : '✗ IBAN Mismatch'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-3">
            {isPass && onViewCertificate && (
              <button
                onClick={() => {
                  onClose();
                  onViewCertificate();
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-[#F5E6B8] border border-[#D4AF37]/50 rounded-xl py-2.5 px-4 text-xs font-bold font-mono-aurum uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-[#F5C542]" />
                <span>View PDF Certificate</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`flex-1 rounded-xl py-2.5 px-4 text-xs font-bold font-mono-aurum uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                isPass
                  ? 'gold-gradient-btn'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40'
              }`}
            >
              <span>{isPass ? 'Inspect Full Ledger' : 'Review Errors'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
