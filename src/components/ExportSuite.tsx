import React from 'react';
import { NoticeExtraction, AuditResult, MandateRecord } from '../types';
import { generateDatevRows, buildCsvString, buildAurumCertifiedCsv } from '../lib/datev';
import { Download, FileText, Database, ShieldCheck, Award } from 'lucide-react';

interface ExportSuiteProps {
  data: NoticeExtraction;
  audit: AuditResult;
  mandate?: MandateRecord | null;
  auditHash: string;
  timestamp: string;
  onOpenPdfCertificate?: () => void;
}

export const ExportSuite: React.FC<ExportSuiteProps> = ({
  data,
  audit,
  mandate,
  auditHash,
  timestamp,
  onOpenPdfCertificate,
}) => {
  // Download ERP CSV (Generic with Aurum Certified Metadata Banner)
  const handleDownloadErpCsv = () => {
    const row = {
      Notice_Date: data.notice_date,
      Due_Date: data.due_date,
      Fund_Name: data.fund_name,
      GP_Name: data.gp_name,
      LP_Name: data.lp_name,
      Currency: data.currency,
      Total_Amount_Due: data.total_amount_due,
      Principal_Call: data.principal_call,
      Management_Fee: data.management_fee,
      Expenses: data.expenses,
      Equalization_Interest: data.equalization_interest,
      Recallable_Capital: data.recallable_capital,
      Fee_Offsets: data.fee_offsets,
      Total_Commitment: data.total_commitment,
      Prior_Contributed: data.prior_contributed,
      Remaining_Uncalled: data.remaining_uncalled,
      Beneficiary_Name: data.beneficiary_name,
      Bank_Name: data.bank_name,
      IBAN: data.iban || '',
      SWIFT_BIC: data.swift_bic,
      Payment_Reference: data.payment_reference || '',
      Audit_Status: audit.math_passed && audit.wire_passed ? 'APPROVED' : 'FLAGGED',
      Audit_Hash: auditHash,
    };

    const csvContent = buildAurumCertifiedCsv([row], {
      noticeDate: data.notice_date,
      fundName: data.fund_name,
      hash: auditHash,
    });
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Aurum_Capital_Call_${data.notice_date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Certified JSON-LD Certificate
  const handleDownloadCertJson = () => {
    const cert = {
      aurum_engine_version: '2.4-sovereign',
      audit_fingerprint: auditHash,
      timestamp,
      mandate_applied: mandate?.fund_name || data.fund_name,
      audit_results: audit,
      extracted_notice_data: data,
    };
    const jsonStr = JSON.stringify(cert, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Aurum_Audit_Certificate_${data.notice_date}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download DATEV CSV
  const handleDownloadDatev = () => {
    const rows = generateDatevRows(data, 'SKR03');
    const csvContent = buildCsvString(rows);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DATEV_Buchungsstapel_${data.notice_date}_SKR03.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="royal-green-glass p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h4 className="font-the-seasons font-bold text-lg text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#F5C542]" />
            <span>Institutional Export & Settlement Suite</span>
          </h4>
          <p className="text-xs text-[#D1E7DD] mt-0.5 leading-relaxed">
            Export certified capital call records directly into your General Ledger, ERP, or Treasury gateway.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {/* PDF Certificate Button */}
        {onOpenPdfCertificate && (
          <button
            onClick={onOpenPdfCertificate}
            className="flex items-center justify-center gap-2.5 bg-[#F5C542]/20 hover:bg-[#F5C542]/30 border border-[#D4AF37]/50 text-[#F5E6B8] hover:text-white p-3.5 rounded-xl text-xs font-mono-aurum font-bold transition group shadow-md cursor-pointer"
          >
            <Award className="w-4 h-4 text-[#F5C542] group-hover:scale-110 transition" />
            <span>PDF AUDIT CERTIFICATE</span>
          </button>
        )}

        {/* ERP CSV */}
        <button
          onClick={handleDownloadErpCsv}
          className="flex items-center justify-center gap-2.5 bg-[#041A12] hover:bg-[#0A3D2B] border border-white/10 hover:border-[#D4AF37]/50 text-slate-200 hover:text-white p-3.5 rounded-xl text-xs font-mono-aurum font-bold transition group shadow-md cursor-pointer"
        >
          <Database className="w-4 h-4 text-[#F5C542] group-hover:scale-110 transition" />
          <span>DOWNLOAD ERP CSV</span>
        </button>

        {/* DATEV CSV */}
        <button
          onClick={handleDownloadDatev}
          className="flex items-center justify-center gap-2.5 bg-[#041A12] hover:bg-[#0A3D2B] border border-white/10 hover:border-[#D4AF37]/50 text-slate-200 hover:text-white p-3.5 rounded-xl text-xs font-mono-aurum font-bold transition group shadow-md cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#F5C542] group-hover:scale-110 transition" />
          <span>DOWNLOAD DATEV STAPEL</span>
        </button>

        {/* JSON Certificate */}
        <button
          onClick={handleDownloadCertJson}
          className="flex items-center justify-center gap-2.5 bg-[#041A12] hover:bg-[#0A3D2B] border border-white/10 hover:border-[#D4AF37]/50 text-slate-200 hover:text-white p-3.5 rounded-xl text-xs font-mono-aurum font-bold transition group shadow-md cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          <span>DOWNLOAD JSON-LD PROOF</span>
        </button>
      </div>
    </div>
  );
};
