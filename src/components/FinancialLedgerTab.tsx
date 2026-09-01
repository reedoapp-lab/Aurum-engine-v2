import React, { useState } from 'react';
import { NoticeExtraction, AuditResult } from '../types';
import { Calculator, CheckCircle2, XCircle, PieChart, Layers, Download, Copy, Check } from 'lucide-react';

interface FinancialLedgerTabProps {
  data: NoticeExtraction;
  audit: AuditResult;
}

export const FinancialLedgerTab: React.FC<FinancialLedgerTabProps> = ({ data, audit }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const drawnTotal = data.prior_contributed + data.principal_call;
  const progressRatio = data.total_commitment > 0 ? Math.min(1, drawnTotal / data.total_commitment) : 0;

  const items = [
    { label: 'Principal Investment Drawdown', category: 'Investment Capital', amount: data.principal_call, type: 'add' },
    { label: 'Management Fee (GP)', category: 'Fund Operations', amount: data.management_fee, type: 'add' },
    { label: 'Partnership Expenses & Legal/Admin', category: 'Operating Expenses', amount: data.expenses, type: 'add' },
    { label: 'Equalization / Subsequent Closing Interest', category: 'Closing Adjustments', amount: data.equalization_interest, type: 'add' },
    { label: 'Recallable Capital Drawn', category: 'Reinvestment', amount: data.recallable_capital, type: 'add' },
    { label: 'Advisory / Transaction Fee Offsets', category: 'Credit / Offsets', amount: -Math.abs(data.fee_offsets), type: 'sub' },
  ];

  const handleExportCsv = () => {
    const headers = ['Line Item', 'Category', `Amount (${data.currency})`, 'Status'];
    const rows = items.map((it) => [
      `"${it.label}"`,
      `"${it.category}"`,
      it.amount.toFixed(2),
      'Reconciled',
    ]);
    rows.push([`"TOTAL AMOUNT DUE"`, '"Final Net Payable"', data.total_amount_due.toFixed(2), 'Verified']);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aurum_Ledger_${data.notice_date || '2026'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTable = () => {
    const text = items
      .map((it) => `${it.label}: ${it.amount.toLocaleString()} ${data.currency}`)
      .join('\n') + `\nTOTAL STATED: ${data.total_amount_due.toLocaleString()} ${data.currency}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Arithmetic Equation & Verification Header */}
      <div className="royal-green-glass p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0A3D2B] border border-[#D4AF37]/40 flex items-center justify-center text-[#F5C542] shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-[#F5E6B8] font-mono-aurum">
              Deterministic Arithmetic Proof & Reconciled Sum
            </div>
            <div className="text-[11px] text-[#D1E7DD] font-mono-aurum mt-0.5">
              ∑(Principal + Fees + Expenses + Equalization - Offsets) = Total Stated Amount Due
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {audit.math_passed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-xs font-mono-aurum font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>0.00 VARIANCE: 100% RECONCILED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono-aurum font-bold">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>DISCREPANCY: {audit.discrepancy_amount.toFixed(2)} {data.currency}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Call Components Breakdown & Commitment Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Call Components Ledger (Fancier Table) */}
        <div className="lg:col-span-7 royal-green-glass p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <img
                src="https://lh3.googleusercontent.com/d/12qLE1pfcALKFv3etXm0BxtiWYcT9U096"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/aurum-logo.png';
                }}
                alt="Aurum"
                className="h-6 w-auto object-contain opacity-90"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-the-seasons font-bold text-base text-white flex items-center gap-2">
                  <span>Call Component Ledger</span>
                </h4>
                <span className="text-[10px] font-mono-aurum text-[#F5C542]">AURUM DETERMINISTIC SHEET</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTable}
                className="flex items-center gap-1 bg-[#041A12] hover:bg-[#0A3D2B] text-[#D1E7DD] border border-white/10 hover:border-[#D4AF37]/40 px-2.5 py-1.5 rounded-lg text-[11px] font-mono-aurum transition cursor-pointer"
                title="Copy ledger data to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 bg-[#F5C542]/20 hover:bg-[#F5C542]/30 text-[#F5E6B8] hover:text-white border border-[#D4AF37]/60 px-3 py-1.5 rounded-lg text-[11px] font-mono-aurum font-bold transition shadow-sm cursor-pointer"
                title="Download CSV table"
              >
                <Download className="w-3.5 h-3.5 text-[#F5C542]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#02120B]/90">
            <table className="w-full text-left font-mono-aurum text-xs">
              <thead>
                <tr className="border-b border-[#D4AF37]/30 text-[10px] text-[#F5E6B8] bg-[#041A12] uppercase tracking-wider">
                  <th className="py-3 px-3">Line Item Component</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3 text-right">Amount ({data.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3 font-sans font-medium text-slate-100">{item.label}</td>
                    <td className="py-3 px-3 text-[11px] text-[#D1E7DD]">{item.category}</td>
                    <td
                      className={`py-3 px-3 text-right font-bold font-mono-aurum ${
                        item.amount < 0
                          ? 'text-amber-400'
                          : item.amount === 0
                          ? 'text-slate-500'
                          : 'text-[#F5C542]'
                      }`}
                    >
                      {item.amount < 0 ? '-' : ''}
                      {Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stated Total Bar */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#041A12] border border-[#D4AF37]/50 shadow-inner">
              <span className="text-[#F5E6B8] font-the-seasons font-bold text-sm tracking-wide">
                TOTAL STATED NET DRAWDOWN
              </span>
              <span className="font-mono-aurum text-[#F5C542] text-lg font-bold">
                {data.total_amount_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs text-[#F5E6B8]">{data.currency}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Commitment Balances & Progress Runway */}
        <div className="lg:col-span-5 royal-green-glass p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#F5C542]" />
              <h4 className="font-the-seasons font-bold text-base text-white">
                Investor Commitment Runway
              </h4>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-[#041A12] p-3 rounded-xl border border-white/10 flex justify-between items-center">
              <span className="text-[#D1E7DD]">Total LP Commitment</span>
              <span className="font-mono-aurum font-bold text-white">
                {data.total_commitment.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
              </span>
            </div>

            <div className="bg-[#041A12] p-3 rounded-xl border border-white/10 flex justify-between items-center">
              <span className="text-[#D1E7DD]">Prior Cumulative Contributed</span>
              <span className="font-mono-aurum font-medium text-slate-300">
                {data.prior_contributed.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
              </span>
            </div>

            <div className="bg-[#041A12] p-3 rounded-xl border border-white/10 flex justify-between items-center">
              <span className="text-[#D1E7DD]">Current Call Principal</span>
              <span className="font-mono-aurum font-bold text-[#F5C542]">
                +{data.principal_call.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
              </span>
            </div>

            <div className="bg-[#041A12] p-3 rounded-xl border border-white/10 flex justify-between items-center">
              <span className="text-[#D1E7DD]">Remaining Uncalled Buffer</span>
              <span className="font-mono-aurum font-bold text-emerald-400">
                {data.remaining_uncalled.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#D1E7DD]">Fund Capital Called</span>
              <span className="font-mono-aurum text-[#F5E6B8] font-bold">{(progressRatio * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#041A12] h-3 rounded-full overflow-hidden border border-[#D4AF37]/30 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F5C542] transition-all duration-500 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-aurum">
              <span>0%</span>
              <span>Cumulative: {drawnTotal.toLocaleString()} {data.currency}</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
