import React from 'react';
import { NoticeExtraction, AuditResult } from '../types';
import { DollarSign, Calendar, CheckCircle2, AlertOctagon, ShieldCheck, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface AuditSummaryProps {
  data: NoticeExtraction;
  audit: AuditResult;
  auditHash: string;
  onOpenCertificate?: () => void;
}

export const AuditSummary: React.FC<AuditSummaryProps> = ({
  data,
  audit,
  auditHash,
  onOpenCertificate,
}) => {
  return (
    <div className="space-y-4">
      {/* Top KPI Ribbon (4 Columns matching Streamlit reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Amount Due */}
        <div className="royal-green-glass-card p-4.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs uppercase tracking-wider font-semibold font-mono-aurum">
            <span>Total Amount Due</span>
            <DollarSign className="w-4 h-4 text-[#F5C542]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-aurum text-[#F5E6B8]">
            {data.total_amount_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
            <span className="text-sm font-normal text-[#F5C542]">{data.currency}</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1.5 flex items-center justify-between font-mono-aurum">
            <span>Calculated: {audit.calculated_call.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${audit.math_passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'}`}>
              {audit.math_passed ? '0.00 VAR' : `DIFF: ${audit.discrepancy_amount.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Metric 2: Due Date */}
        <div className="royal-green-glass-card p-4.5">
          <div className="flex items-center justify-between text-slate-300 text-xs uppercase tracking-wider font-semibold font-mono-aurum">
            <span>Due Date</span>
            <Calendar className="w-4 h-4 text-[#F5C542]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono-aurum text-white">
            {data.due_date}
          </div>
          <div className="text-[11px] text-slate-300 mt-1.5 font-mono-aurum">
            Notice Date: <span className="text-[#F5E6B8]">{data.notice_date}</span>
          </div>
        </div>

        {/* Metric 3: Math Reconciliation */}
        <div className={`p-4.5 rounded-2xl border transition shadow-sm ${
          audit.math_passed
            ? 'bg-emerald-950/70 border-emerald-500/50 text-white'
            : 'bg-rose-950/80 border-rose-500/60 text-white'
        }`}>
          <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold font-mono-aurum">
            <span className="text-slate-200">Math Reconciliation</span>
            {audit.math_passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className={`mt-2 text-xl font-bold font-mono-aurum ${audit.math_passed ? 'text-emerald-300' : 'text-rose-300'}`}>
            {audit.math_passed ? 'PASSED' : 'FAILED'}
          </div>
          <div className="text-[11px] text-slate-200 mt-1.5 font-mono-aurum">
            {audit.math_passed ? '✓ Line-item arithmetic verified' : '🚨 Arithmetic variance detected'}
          </div>
        </div>

        {/* Metric 4: Bank Wire Check */}
        <div className={`p-4.5 rounded-2xl border transition shadow-sm ${
          audit.wire_passed
            ? 'bg-emerald-950/70 border-emerald-500/50 text-white'
            : 'bg-rose-950/80 border-rose-500/60 text-white'
        }`}>
          <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold font-mono-aurum">
            <span className="text-slate-200">Bank Wire Check</span>
            {audit.wire_passed ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className={`mt-2 text-xl font-bold font-mono-aurum ${audit.wire_passed ? 'text-emerald-300' : 'text-rose-300'}`}>
            {audit.wire_passed ? 'VERIFIED' : 'WARNING'}
          </div>
          <div className="text-[11px] text-slate-200 mt-1.5 font-mono-aurum truncate">
            {audit.wire_passed ? '✓ IBAN Modulo-97 & Mandate OK' : '⚠️ Mandate / IBAN deviation'}
          </div>
        </div>
      </div>

      {/* Alert Box for Errors and Warnings */}
      {audit.errors && audit.errors.length > 0 && (
        <div className="space-y-2">
          {audit.errors.map((err, i) => (
            <div
              key={`err-${i}`}
              className="bg-rose-950/80 border border-rose-500/60 text-rose-100 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5 font-mono-aurum shadow-md"
            >
              <span className="text-base shrink-0">🚨</span>
              <div className="flex-1 font-medium">{err}</div>
            </div>
          ))}
        </div>
      )}

      {audit.warnings && audit.warnings.length > 0 && (
        <div className="space-y-2">
          {audit.warnings.map((warn, i) => (
            <div
              key={`warn-${i}`}
              className="bg-amber-950/80 border border-amber-500/60 text-amber-100 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5 font-mono-aurum shadow-md"
            >
              <span className="text-base shrink-0">⚠️</span>
              <div className="flex-1 font-medium">{warn}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
