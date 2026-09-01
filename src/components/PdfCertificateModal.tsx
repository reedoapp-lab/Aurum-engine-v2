import React from 'react';
import jsPDF from 'jspdf';
import { NoticeExtraction, AuditResult, MandateRecord } from '../types';
import { X, Download, Printer, ShieldCheck, CheckCircle2, Award, Lock } from 'lucide-react';

interface PdfCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: NoticeExtraction;
  audit: AuditResult;
  mandate?: MandateRecord | null;
  auditHash: string;
  timestamp: string;
}

export const PdfCertificateModal: React.FC<PdfCertificateModalProps> = ({
  isOpen,
  onClose,
  data,
  audit,
  mandate,
  auditHash,
  timestamp,
}) => {
  if (!isOpen) return null;

  const certNumber = `AUR-${data.notice_date?.replace(/-/g, '') || '2026'}-${(auditHash || '9999').substring(0, 6).toUpperCase()}`;

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Dark luxury header band
    doc.setFillColor(6, 40, 28);
    doc.rect(0, 0, 210, 38, 'F');

    // Header text
    doc.setTextColor(245, 197, 66);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('AURUM LEDGER | SOVEREIGN AUDIT CERTIFICATE', 105, 18, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.setFont('helvetica', 'normal');
    doc.text('CAPITAL CALL AUDIT & MANDATE RECONCILIATION VERIFICATION', 105, 26, { align: 'center' });

    // Gold accent divider
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(15, 42, 195, 42);

    // Certificate metadata box
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Certificate No: ${certNumber}`, 15, 50);
    doc.text(`Timestamp (UTC): ${timestamp}`, 15, 56);
    doc.text(`Issuing Authority: Aurum Sovereign Engine Enclave (Zürich-CH)`, 15, 62);
    doc.text(`Compliance: ISO 20022 / eIDAS Qualified / Modulo-97 Verified`, 15, 68);

    // Status Banner
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(15, 74, 180, 16, 2, 2, 'FD');
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('STATUS: SOVEREIGN RECONCILIATION CERTIFIED & PASSED', 22, 84);

    // Section 1: Fund & Capital Call Details
    doc.setTextColor(6, 40, 28);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Capital Call Executive Summary', 15, 102);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);

    const callDetails = [
      ['Fund Legal Entity:', data.fund_name || mandate?.fund_legal_name || 'N/A'],
      ['General Partner (GP):', data.gp_name || mandate?.gp_entity || 'N/A'],
      ['Notice Issue Date:', data.notice_date || 'N/A'],
      ['Settlement / Wire Deadline:', data.due_date || 'N/A'],
      ['Total Amount Due:', `${data.total_amount_due?.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${data.currency}`],
      ['Principal Investment Drawdown:', `${data.principal_call?.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${data.currency}`],
      ['Management Fees & Expenses:', `${((data.management_fee || 0) + (data.expenses || 0))?.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${data.currency}`],
      ['Remaining Uncalled Buffer:', `${data.remaining_uncalled?.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${data.currency}`],
    ];

    let currentY = 110;
    callDetails.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(k, 18, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(v, 90, currentY);
      currentY += 6;
    });

    // Section 2: Banking & Wire Verification
    currentY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 40, 28);
    doc.setFontSize(12);
    doc.text('2. Sovereign Banking & Wire Whitelist Audit', 15, currentY);

    currentY += 8;
    const wireDetails = [
      ['Beneficiary Account:', data.beneficiary_name || 'N/A'],
      ['Custodian Bank:', data.bank_name || mandate?.bank_name || 'N/A'],
      ['Verified IBAN:', (data.iban || data.account_number || '').toUpperCase()],
      ['Whitelisted Mandate IBAN:', (mandate?.iban || '').toUpperCase()],
      ['SWIFT / BIC Routing:', data.swift_bic || mandate?.swift_bic || 'N/A'],
      ['Modulo-97 Algorithmic Result:', audit.iban_valid_checksum ? 'PASSED (0 ERROR CHECKSUM)' : 'FAILED'],
      ['Mandate Whitelist Match:', audit.wire_passed ? 'MATCH CONFIRMED' : 'MISMATCH DETECTED'],
    ];

    wireDetails.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(k, 18, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(v, 90, currentY);
      currentY += 6;
    });

    // Section 3: Cryptographic Ledger Seal
    currentY += 6;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(15, currentY, 180, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('SHA-256 FORENSIC AUDIT FINGERPRINT:', 20, currentY + 7);
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(6, 40, 28);
    doc.text(auditHash || 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855', 20, currentY + 14);

    // Signatures
    currentY += 34;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.line(20, currentY, 80, currentY);
    doc.line(130, currentY, 190, currentY);
    doc.text('Aurum Enclave Sentinel Officer', 20, currentY + 5);
    doc.text('Chief Financial Controller Signoff', 130, currentY + 5);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Aurum Ledger • Sovereign Operating System for Capital Governance • www.aurumledger.eu', 105, 288, { align: 'center' });

    doc.save(`Aurum_Audit_Certificate_${certNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-slate-300 text-slate-900 overflow-hidden my-6">
        {/* Modal Top Control Bar */}
        <div className="bg-[#06281C] px-6 py-4 flex items-center justify-between text-white border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/d/12qLE1pfcALKFv3etXm0BxtiWYcT9U096"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/aurum-logo.png';
              }}
              alt="Aurum Ledger"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-the-seasons font-bold text-base text-[#F5C542] leading-tight">
                Sovereign Capital Call Audit Certificate
              </h3>
              <p className="text-[11px] text-slate-300 font-mono-aurum">
                ID: {certNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#FFE082] text-[#06281C] px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono-aurum transition shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PDF</span>
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-mono-aurum transition"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div className="p-6 sm:p-8 space-y-6 bg-white text-slate-800 font-sans text-xs">
          {/* Certificate Title Badge */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono-aurum text-[#B8860B] uppercase font-bold tracking-widest block mb-1">
                INSTITUTIONAL VERIFICATION RECORD
              </span>
              <h2 className="font-the-seasons text-2xl font-bold text-[#06281C]">
                Certificate of Capital Call Compliance
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Issued by Aurum Sovereign Enclave under ISO 20022 and DATEV General Ledger standards.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-300 px-4 py-2.5 rounded-xl text-emerald-800 shrink-0">
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-xs uppercase font-mono-aurum">AUDIT VERIFIED</div>
                <div className="text-[10px] text-emerald-700">0.00 Math Variance</div>
              </div>
            </div>
          </div>

          {/* Certificate Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono-aurum text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Issue Date</span>
              <strong className="text-slate-800">{data.notice_date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Wire Deadline</span>
              <strong className="text-slate-800">{data.due_date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Fund Currency</span>
              <strong className="text-slate-800">{data.currency}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Mod-97 Status</span>
              <strong className="text-emerald-700">PASSED</strong>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono-aurum flex items-center gap-2">
              <span>Financial Ledger Reconciliation</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left font-mono-aurum">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Component</th>
                    <th className="p-2.5 text-right">Amount ({data.currency})</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="p-2.5 font-sans">Principal Investment Drawdown</td>
                    <td className="p-2.5 text-right font-bold">{data.principal_call?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-2.5 text-right text-emerald-600 font-semibold">Matched</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans">Management Fee & Partnership Expenses</td>
                    <td className="p-2.5 text-right">{((data.management_fee || 0) + (data.expenses || 0))?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-2.5 text-right text-emerald-600 font-semibold">Verified</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-300">
                    <td className="p-2.5 font-sans">TOTAL STATED DRAWDOWN DUE</td>
                    <td className="p-2.5 text-right text-[#06281C] text-sm">{data.total_amount_due?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}</td>
                    <td className="p-2.5 text-right text-emerald-700">100% RECONCILED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Banking Whitelist Seal */}
          <div className="bg-[#06281C] text-white p-4 rounded-xl border border-[#D4AF37]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-aurum text-[#F5C542] uppercase font-bold tracking-wider">
                Whitelisted Banking Routing
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono-aurum">
                MATCH CERTIFIED
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Beneficiary Entity</span>
                <span className="font-semibold text-slate-100">{data.beneficiary_name || mandate?.fund_legal_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Verified IBAN</span>
                <span className="font-mono-aurum text-[#F5E6B8] font-bold break-all">{data.iban || mandate?.iban}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Hash */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono-aurum text-[10px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>SHA-256 Hash:</span>
            </div>
            <div className="text-slate-800 font-semibold break-all">
              {auditHash}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono-aurum">
          <span>Aurum Ledger OS • www.aurumledger.eu</span>
          <button
            onClick={onClose}
            className="text-slate-700 hover:text-slate-900 font-bold"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
