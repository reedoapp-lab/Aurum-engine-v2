import React from 'react';
import { NoticeExtraction, AuditResult, MandateRecord } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, DollarSign, Calendar, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';

interface AuditSummaryProps {
  data: NoticeExtraction;
  audit: AuditResult;
  mandate?: MandateRecord | null;
  auditHash: string;
  onOpenCertificate?: () => void;
}

export const AuditSummary: React.FC<AuditSummaryProps> = ({
  data,
  audit,
  mandate,
  auditHash,
  onOpenCertificate,
}) => {
  const isAllPassed = audit.math_passed && audit.wire_passed;
  const isWireAlert = !audit.wire_passed;
  const calledPercent =
    data.total_commitment > 0
      ? ((data.prior_contributed + data.principal_call) / data.total_commitment) * 100
      : 0;

  return (
    <div className="space-y-4">
      {/* Executive Status Banner */}
      {isAllPassed ? (
        <div className="royal-green-glass p-5 border border-[#D4AF37]/40 shadow-[0_8px_30px_rgba(6,40,28,0.35)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-[#F5C542] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              <ShieldCheck className="w-7 h-7 text-[#F5C542]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white font-the-seasons tracking-wide">
                  Sovereign Audit Certification: 100% Reconciled
                </h4>
                <span className="text-[10px] font-mono-aurum bg-[#F5C542]/20 text-[#F5E6B8] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full font-bold uppercase">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-[#D1E7DD] mt-1 leading-relaxed">
                All capital call sub-components sum with 0.00 variance. Banking coordinates match approved registry for{' '}
                <strong className="text-white font-semibold">{data.fund_name}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenCertificate && (
              <button
                onClick={onOpenCertificate}
                className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-mono-aurum font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>View Certificate</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#06281C]" />
              </button>
            )}
          </div>
        </div>
      ) : isWireAlert ? (
        <div className="bg-gradient-to-r from-rose-950/90 via-rose-900/80 to-rose-950/90 border border-rose-500/60 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-[0_8px_30px_rgba(239,68,68,0.25)] text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-rose-200 font-the-seasons tracking-wide">
                  Critical Wire Integrity Alert: Discrepancy Detected
                </h4>
                <span className="text-[10px] font-mono-aurum bg-rose-500/30 text-rose-200 border border-rose-500/50 px-2 py-0.5 rounded-full font-bold">
                  HOLD EXECUTION
                </span>
              </div>
              <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                Notice bank routing coordinates deviate from approved mandate baseline. Do NOT execute automated wire transfer prior to secondary CFO signoff.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-950/90 to-amber-900/80 border border-amber-500/60 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-[0_8px_30px_rgba(245,158,11,0.25)] text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-amber-200 font-the-seasons tracking-wide">
                  Arithmetic Variance: Discrepancy Flagged
                </h4>
                <span className="text-[10px] font-mono-aurum bg-amber-500/30 text-amber-200 border border-amber-500/50 px-2 py-0.5 rounded-full font-bold">
                  MATH VARIANCE
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">
                Sum of items does not match the stated total amount due. Review component breakdown below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Errors & Warnings Notification Stack */}
      {audit.errors.length > 0 && (
        <div className="space-y-2">
          {audit.errors.map((err, i) => (
            <div
              key={i}
              className="bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs px-4 py-2.5 rounded-xl flex items-start gap-2 font-medium"
            >
              <span className="text-rose-400 font-bold shrink-0">🚨 ERROR:</span>
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {audit.warnings.length > 0 && (
        <div className="space-y-2">
          {audit.warnings.map((warn, i) => (
            <div
              key={i}
              className="bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs px-4 py-2.5 rounded-xl flex items-start gap-2 font-medium"
            >
              <span className="text-amber-400 font-bold shrink-0">⚠️ AUDIT NOTICE:</span>
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Deep Royal Green Translucent KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Amount Due */}
        <div className="royal-green-glass-card p-4.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D1E7DD] text-xs uppercase tracking-wider font-semibold font-mono-aurum">
            <span>Total Amount Due</span>
            <DollarSign className="w-4 h-4 text-[#F5C542]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-aurum text-[#F5E6B8]">
            {data.total_amount_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
            <span className="text-sm font-normal text-[#F5C542]">{data.currency}</span>
          </div>
          <div className="text-[11px] text-[#D1E7DD] mt-1.5 flex items-center gap-1.5">
            <span>Drawdown Net Payable</span>
            <span className="text-emerald-300 text-[10px] bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono-aurum">
              STATED
            </span>
          </div>
        </div>

        {/* Due Date */}
        <div className="royal-green-glass-card p-4.5">
          <div className="flex items-center justify-between text-[#D1E7DD] text-xs uppercase tracking-wider font-semibold font-mono-aurum">
            <span>Wire Deadline</span>
            <Calendar className="w-4 h-4 text-[#F5C542]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-aurum text-white">
            {data.due_date}
          </div>
          <div className="text-[11px] text-[#D1E7DD] mt-1.5 font-mono-aurum">
            Issued: <span className="text-[#F5E6B8]">{data.notice_date}</span>
          </div>
        </div>

        {/* Cumulative Drawn */}
        <div className="royal-green-glass-card p-4.5">
          <div className="flex items-center justify-between text-[#D1E7DD] text-xs uppercase tracking-wider font-semibold font-mono-aurum">
            <span>Cumulative Drawn</span>
            <TrendingUp className="w-4 h-4 text-[#F5C542]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-aurum text-white">
            {calledPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#D1E7DD] mt-1.5 truncate font-mono-aurum">
            Commitment: {data.total_commitment.toLocaleString()} {data.currency}
          </div>
        </div>

        {/* Remaining Uncalled Buffer */}
        <div className="royal-green-glass-card p-4.5">
          <div className="flex items-center justify-between text-[#D1E7DD] text-xs uppercase tracking-wider font-semibold font-mono-aurum">
            <span>Uncalled Capital Buffer</span>
            <Wallet className="w-4 h-4 text-[#F5C542]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-aurum text-white">
            {data.remaining_uncalled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#D1E7DD] mt-1.5 font-mono-aurum">
            {data.currency} Remaining Unfunded
          </div>
        </div>
      </div>
    </div>
  );
};
