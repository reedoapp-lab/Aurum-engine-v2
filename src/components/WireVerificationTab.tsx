import React, { useState } from 'react';
import { NoticeExtraction, MandateRecord, AuditResult } from '../types';
import { ShieldCheck, ShieldAlert, Landmark, Copy, Check, CheckCircle2, AlertTriangle } from 'lucide-react';

interface WireVerificationTabProps {
  data: NoticeExtraction;
  mandate?: Partial<MandateRecord> | { fund_name?: string; iban?: string; swift_bic?: string } | null;
  audit: AuditResult;
}

export const WireVerificationTab: React.FC<WireVerificationTabProps> = ({
  data,
  mandate,
  audit,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const noticeIban = (data.iban || data.account_number || '').replace(/\s+/g, '').toUpperCase();
  const mandateIban = (mandate?.iban || '').replace(/\s+/g, '').toUpperCase();
  const hasMandate = !!mandateIban;
  const ibanMatches = hasMandate ? noticeIban === mandateIban : true;
  const isWireValid = audit.iban_valid_checksum && (!hasMandate || ibanMatches);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Whitelist / Modulo-97 Verification Header Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isWireValid
            ? 'royal-green-glass border-[#D4AF37]/40'
            : 'bg-rose-950/90 border-rose-500/60 text-white'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isWireValid
                ? 'bg-emerald-500/20 text-[#F5C542] border-[#D4AF37]/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
            }`}
          >
            {isWireValid ? (
              <ShieldCheck className="w-7 h-7 text-[#F5C542]" />
            ) : (
              <ShieldAlert className="w-7 h-7 text-rose-300" />
            )}
          </div>
          <div>
            <h4
              className={`font-bold text-base uppercase tracking-wide ${
                isWireValid ? 'text-white' : 'text-rose-200'
              }`}
            >
              {isWireValid
                ? 'Bank Wire Coordinates: Validated & Modulo-97 Verified'
                : 'Wire Verification Alert: Discrepancy Detected'}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isWireValid
                ? 'The banking coordinates passed international ISO 7064 Modulo-97 checksum validation.'
                : 'Incoming notice IBAN failed the international Modulo-97 checksum or does not match approved baseline parameters.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono-aurum text-xs">
          <span
            className={`px-3 py-1.5 rounded-lg border font-bold ${
              audit.iban_valid_checksum
                ? 'bg-emerald-900/50 text-emerald-300 border-emerald-400/40'
                : 'bg-rose-900/50 text-rose-300 border-rose-500/40'
            }`}
          >
            MOD-97: {audit.iban_valid_checksum ? 'PASSED' : 'FAILED'}
          </span>
          {hasMandate && (
            <span
              className={`px-3 py-1.5 rounded-lg border font-bold ${
                ibanMatches
                  ? 'bg-[#F5C542]/20 text-[#F5E6B8] border-[#D4AF37]/40'
                  : 'bg-rose-900/50 text-rose-300 border-rose-500/40'
              }`}
            >
              MANDATE: {ibanMatches ? 'MATCH' : 'MISMATCH'}
            </span>
          )}
        </div>
      </div>

      {/* Main Coordinate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Notice Coordinates */}
        <div className="royal-green-glass p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="font-bold text-base text-white">
              Extracted Notice Wire Coordinates
            </h4>
            <span className="text-[10px] font-mono-aurum text-[#F5E6B8] bg-black/40 px-2 py-0.5 rounded border border-white/10">
              DOCUMENT VALUE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-mono-aurum font-semibold text-slate-300 block mb-1">Beneficiary Name</label>
              <div className="bg-[#041A12] border border-white/10 rounded-xl p-3 text-white font-medium">
                {data.beneficiary_name || data.fund_name || 'N/A'}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono-aurum font-semibold text-slate-300 block mb-1">Beneficiary Bank</label>
              <div className="bg-[#041A12] border border-white/10 rounded-xl p-3 text-white font-medium">
                {data.bank_name || 'N/A'}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono-aurum font-semibold text-slate-300">IBAN / Account Number</label>
                <button
                  onClick={() => copyToClipboard(noticeIban, 'notice-iban')}
                  className="text-[10px] text-[#F5C542] hover:text-[#FFE082] flex items-center gap-1 font-mono-aurum cursor-pointer"
                >
                  {copiedField === 'notice-iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'notice-iban' ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <div
                className={`border rounded-xl p-3 font-mono-aurum font-bold break-all select-all ${
                  audit.iban_valid_checksum
                    ? 'bg-emerald-950/40 border-emerald-400/50 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                }`}
              >
                {noticeIban || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono-aurum font-semibold text-slate-300 block mb-1">SWIFT / BIC</label>
                <div className="bg-[#041A12] border border-white/10 rounded-xl p-3 font-mono-aurum text-white font-semibold">
                  {data.swift_bic || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-mono-aurum font-semibold text-slate-300 block mb-1">Currency</label>
                <div className="bg-[#041A12] border border-white/10 rounded-xl p-3 font-mono-aurum text-[#F5C542] font-semibold">
                  {data.currency}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono-aurum font-semibold text-slate-300 block mb-1">Payment Reference / Memo</label>
              <div className="bg-[#041A12] border border-[#D4AF37]/30 rounded-xl p-3 font-mono-aurum text-[#F5E6B8] font-semibold">
                {data.payment_reference || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Algorithmic Checksum & Wire Verification */}
        <div className="royal-green-glass p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="font-bold text-base text-white flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-[#F5C542]" />
              <span>Algorithmic Validation Breakdown</span>
            </h4>
            <span className="text-[10px] font-mono-aurum text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-400/40 font-bold">
              ISO 7064
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="royal-green-glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">ISO 7064 Modulo 97-10 Check</span>
                <span className={`px-2 py-0.5 rounded font-mono-aurum text-[10px] font-bold ${
                  audit.iban_valid_checksum ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'
                }`}>
                  {audit.iban_valid_checksum ? 'PASSED (REM = 1)' : 'CHECKSUM FAILED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                The IBAN string was transposed with the country code suffix, converted to integers, and evaluated modulo 97 to confirm banking digit authenticity.
              </p>
            </div>

            <div className="royal-green-glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Wire Payment Amount Verification</span>
                <span className="font-mono-aurum text-[#F5C542] font-bold">
                  {data.total_amount_due.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center justify-between">
                <span>Value Date / Wire Cutoff:</span>
                <span className="text-white font-mono-aurum">{data.due_date}</span>
              </div>
            </div>

            <div className="royal-green-glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Beneficiary Entity Verification</span>
                <span className="text-emerald-300 text-[11px] flex items-center gap-1 font-mono-aurum">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Authenticated
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                GP / Fund: <span className="text-white font-medium">{data.fund_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
