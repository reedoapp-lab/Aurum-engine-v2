import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DocumentIntake } from './components/DocumentIntake';
import { AuditSummary } from './components/AuditSummary';
import { FinancialLedgerTab } from './components/FinancialLedgerTab';
import { WireVerificationTab } from './components/WireVerificationTab';
import { DatevEngineTab } from './components/DatevEngineTab';
import { CryptoReceiptTab } from './components/CryptoReceiptTab';
import { ExportSuite } from './components/ExportSuite';
import { InteractiveDotGrid } from './components/InteractiveDotGrid';
import { PassFailModal } from './components/PassFailModal';
import { PdfCertificateModal } from './components/PdfCertificateModal';

import { NoticeExtraction, AuditResult } from './types';
import { auditNotice } from './lib/auditor';
import { generateAuditHash } from './lib/datev';

import { Layers, ShieldCheck, FileSpreadsheet, Lock, Award, ArrowUpRight, Upload } from 'lucide-react';

export const App: React.FC = () => {
  // Flag indicating whether a document has been uploaded & audited
  const [hasRunAudit, setHasRunAudit] = useState<boolean>(false);

  // Initial clean notice state matching NoticeExtraction schema
  const [currentNoticeData, setCurrentNoticeData] = useState<NoticeExtraction>({
    fund_name: 'CAPITAL PARTNERS FUND IV',
    gp_name: 'General Partner S.à r.l.',
    lp_name: 'Institutional Mandate Account',
    notice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: 'EUR',
    total_amount_due: 1450000.0,
    principal_call: 1250000.0,
    management_fee: 140000.0,
    expenses: 60000.0,
    equalization_interest: 0.0,
    recallable_capital: 0.0,
    fee_offsets: 0.0,
    total_commitment: 10000000.0,
    prior_contributed: 4500000.0,
    remaining_uncalled: 4250000.0,
    beneficiary_name: 'Capital Partners Fund IV SCSp',
    bank_name: 'Banque Internationale à Luxembourg (BIL)',
    iban: 'LU12345678901234567890',
    swift_bic: 'BILLULLX',
    account_number: 'LU12345678901234567890',
    payment_reference: `CALL-${new Date().getFullYear()}-LP8841`,
  });

  const [currentMandateCheck, setCurrentMandateCheck] = useState<{ fund_name: string; iban: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'ledger' | 'wire' | 'datev' | 'crypto'>('ledger');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult>(() =>
    auditNotice(currentNoticeData, currentMandateCheck)
  );
  const [auditHash, setAuditHash] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>(() =>
    new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
  );

  // Modal states for Pass/Fail animation & PDF certificate
  const [isPassFailModalOpen, setIsPassFailModalOpen] = useState<boolean>(false);
  const [isPdfCertModalOpen, setIsPdfCertModalOpen] = useState<boolean>(false);

  // Re-run audit whenever noticeData or mandate changes
  useEffect(() => {
    const res = auditNotice(currentNoticeData, currentMandateCheck);
    setAuditResult(res);
    generateAuditHash(currentNoticeData, res).then((hash) => setAuditHash(hash));
  }, [currentNoticeData, currentMandateCheck]);

  const handleRunAudit = (data: NoticeExtraction, mandateCheck?: { fund_name: string; iban: string } | null) => {
    setIsLoading(true);
    if (mandateCheck !== undefined) {
      setCurrentMandateCheck(mandateCheck);
    }
    setTimeout(() => {
      setCurrentNoticeData(data);
      setTimestamp(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
      setHasRunAudit(true);
      setIsLoading(false);
      // Trigger Pass/Fail animation modal
      setIsPassFailModalOpen(true);
    }, 500);
  };

  return (
    <div className="relative min-h-screen text-slate-900 flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#06281C]">
      {/* 1. Interactive Illuminating Dot Grid Canvas */}
      <InteractiveDotGrid />

      {/* 2. Sovereign Header with Stag Emblem */}
      <Header />

      {/* 3. Hero Section with Clear Typography and Translucent Glass */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3 w-full">
        <div className="royal-green-glass p-6 sm:p-8 shadow-[0_20px_50px_rgba(6,40,28,0.35)]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-aurum font-bold text-[#F5C542] tracking-widest uppercase bg-[#041A12]/80 px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-inner">
                  CAPITAL CALL AUDIT ENGINE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Aurum Engine <span className="gold-gradient-text">Notice Auditor</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl font-normal">
                Upload incoming GP notices to parse figures, verify arithmetic, validate bank coordinates via Modulo-97, and notify of all financial discrepancies.
              </p>
            </div>

            {/* Quick Actions & Status */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => setIsPdfCertModalOpen(true)}
                className="gold-gradient-btn px-5 py-3 rounded-xl text-xs font-mono-aurum font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Award className="w-4 h-4 text-[#06281C]" />
                <span>PDF AUDIT CERTIFICATE</span>
              </button>

              <div className="bg-[#041A12]/90 border border-[#D4AF37]/30 rounded-xl p-3 flex items-center justify-between gap-4 text-xs font-mono-aurum shadow-inner">
                <div className="border-r border-white/10 pr-4">
                  <div className="text-[10px] text-slate-400 uppercase">Audit Status</div>
                  <div className={`font-bold mt-0.5 ${auditResult.math_passed && auditResult.wire_passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {auditResult.math_passed && auditResult.wire_passed ? '● 100% RECONCILED' : '▲ DISCREPANCY'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Modulo-97</div>
                  <div className={`font-bold mt-0.5 ${auditResult.iban_valid_checksum ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {auditResult.iban_valid_checksum ? '✓ VALID' : '✗ FAILED'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main Operational Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-8">
        {/* Document Intake & Upload Section (Always visible) */}
        <DocumentIntake
          onRunAudit={handleRunAudit}
          isLoading={isLoading}
          currentData={currentNoticeData}
        />

        {/* Forensic Results & Audit Matrix: Revealed once notice is uploaded and checks are executed */}
        {hasRunAudit && (
          <div className="space-y-8 animate-fadeIn">
            {/* Audit Executive Summary & Top KPI Ribbon with Notifications */}
            <AuditSummary
              data={currentNoticeData}
              audit={auditResult}
              auditHash={auditHash}
              onOpenCertificate={() => setIsPdfCertModalOpen(true)}
            />

            {/* Tabbed Forensic Analysis Matrix */}
            <div className="space-y-4">
              {/* Navigation Tabs */}
              <div className="flex border-b border-[#D4AF37]/25 gap-1.5 sm:gap-2 overflow-x-auto pb-px bg-[#06281C]/50 backdrop-blur-xl p-2 rounded-t-2xl border-t border-x border-[#D4AF37]/35 shadow-lg">
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-aurum font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'ledger'
                      ? 'bg-[#F5C542] text-[#06281C] shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Financial Breakdown</span>
                </button>

                <button
                  onClick={() => setActiveTab('wire')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-aurum font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'wire'
                      ? 'bg-[#F5C542] text-[#06281C] shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Wiring Instructions</span>
                </button>

                <button
                  onClick={() => setActiveTab('datev')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-aurum font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'datev'
                      ? 'bg-[#F5C542] text-[#06281C] shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>DATEV SKR03/04 Engine</span>
                </button>

                <button
                  onClick={() => setActiveTab('crypto')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-aurum font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'crypto'
                      ? 'bg-[#F5C542] text-[#06281C] shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Raw JSON & Audit Trail</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'ledger' && (
                <FinancialLedgerTab
                  data={currentNoticeData}
                  audit={auditResult}
                />
              )}

              {activeTab === 'wire' && (
                <WireVerificationTab
                  data={currentNoticeData}
                  mandate={currentMandateCheck ? { id: 'selected', fund_legal_name: currentMandateCheck.fund_name, fund_name: currentMandateCheck.fund_name, iban: currentMandateCheck.iban, swift_bic: '', total_commitment: 0, currency: currentNoticeData.currency } : null}
                  audit={auditResult}
                />
              )}

              {activeTab === 'datev' && (
                <DatevEngineTab
                  data={currentNoticeData}
                />
              )}

              {activeTab === 'crypto' && (
                <CryptoReceiptTab
                  data={currentNoticeData}
                  audit={auditResult}
                  auditHash={auditHash}
                  timestamp={timestamp}
                />
              )}
            </div>

            {/* Export & Settlement Suite */}
            <ExportSuite
              data={currentNoticeData}
              audit={auditResult}
              auditHash={auditHash}
              timestamp={timestamp}
              onOpenPdfCertificate={() => setIsPdfCertModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* 5. Pass/Fail Animation Modal */}
      <PassFailModal
        isOpen={isPassFailModalOpen}
        onClose={() => setIsPassFailModalOpen(false)}
        audit={auditResult}
        data={currentNoticeData}
        onViewCertificate={() => setIsPdfCertModalOpen(true)}
      />

      {/* 6. Full Screen PDF Certificate Viewer & Downloader */}
      <PdfCertificateModal
        isOpen={isPdfCertModalOpen}
        onClose={() => setIsPdfCertModalOpen(false)}
        data={currentNoticeData}
        audit={auditResult}
        auditHash={auditHash}
        timestamp={timestamp}
      />

      {/* 7. Institutional Footer */}
      <footer className="relative z-10 border-t border-[#D4AF37]/30 bg-[#06281C] py-7 text-xs text-slate-300 mt-12 shadow-[0_-4px_25px_rgba(6,40,28,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/d/12qLE1pfcALKFv3etXm0BxtiWYcT9U096"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/aurum-logo.png';
              }}
              alt="Aurum Ledger"
              className="h-7 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-sans">
                — Capital Call Verification Engine
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-4 text-[11px] font-mono-aurum text-[#F5E6B8]">
            <span>ISO 7064 Modulo-97</span>
            <span>•</span>
            <span>DATEV SKR03/04</span>
            <span>•</span>
            <span>SHA-256 Verified</span>
            <span>•</span>
            <a
              href="https://www.aurumledger.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5C542] hover:underline"
            >
              aurumledger.eu
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
