import React, { useState } from 'react';
import { NoticeExtraction, AuditResult } from '../types';
import { Fingerprint, Copy, Check, FileCode } from 'lucide-react';

interface CryptoReceiptTabProps {
  data: NoticeExtraction;
  audit: AuditResult;
  auditHash: string;
  timestamp: string;
}

export const CryptoReceiptTab: React.FC<CryptoReceiptTabProps> = ({
  data,
  audit,
  auditHash,
  timestamp,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const rawJson = JSON.stringify(
    {
      aurum_engine_version: '2.4-sovereign',
      audit_fingerprint: auditHash,
      timestamp,
      mandate_verification: {
        math_reconciliation: audit.math_passed,
        wire_coordinates_matched: audit.wire_passed,
        iban_checksum_mod97: audit.iban_valid_checksum,
      },
      extracted_payload: data,
    },
    null,
    2
  );

  const copyJson = () => {
    navigator.clipboard.writeText(rawJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const copyHash = () => {
    navigator.clipboard.writeText(auditHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Forensic Certificate Badge */}
      <div className="royal-green-glass p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#F5C542] font-the-seasons font-bold text-base">
            <Fingerprint className="w-5 h-5 text-[#F5C542]" />
            <span>Sovereign SHA-256 Cryptographic Audit Fingerprint</span>
          </div>
          <button
            onClick={copyHash}
            className="text-[11px] font-mono-aurum text-[#F5C542] hover:text-[#FFE082] flex items-center gap-1.5 cursor-pointer"
          >
            {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHash ? 'COPIED' : 'COPY HASH'}</span>
          </button>
        </div>

        <div className="bg-[#041A12] border border-white/10 rounded-xl p-3.5 font-mono-aurum text-xs text-emerald-300 break-all select-all font-semibold shadow-inner">
          {auditHash}
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-[#D1E7DD] gap-2 pt-1 font-mono-aurum">
          <span>Timestamp: <strong className="text-white">{timestamp}</strong></span>
          <span>Standard: <strong className="text-[#F5E6B8]">ISO 20022 / eIDAS Qualified</strong></span>
          <span>Residency: <strong className="text-emerald-400">Swiss Tier-4 Enclave</strong></span>
        </div>
      </div>

      {/* Raw Forensic JSON Explorer */}
      <div className="royal-green-glass p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-the-seasons font-bold text-base">
            <FileCode className="w-4 h-4 text-[#F5C542]" />
            <span>Certified Extraction Payload (JSON-LD)</span>
          </div>
          <button
            onClick={copyJson}
            className="flex items-center gap-1.5 text-xs text-[#F5C542] hover:text-[#FFE082] font-mono-aurum font-semibold cursor-pointer"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedJson ? 'COPIED JSON' : 'COPY JSON'}</span>
          </button>
        </div>

        <pre className="bg-[#041A12] border border-white/10 rounded-xl p-4 font-mono-aurum text-xs text-[#F5E6B8] overflow-x-auto max-h-[380px] leading-relaxed">
          {rawJson}
        </pre>
      </div>
    </div>
  );
};
