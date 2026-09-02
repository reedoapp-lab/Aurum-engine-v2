import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MandateSidebar, KNOWN_FUNDS_REGISTRY } from './components/MandateSidebar';
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

import { Layers, ShieldCheck, FileSpreadsheet, Lock, Award, FileText, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Flag indicating whether a document has been uploaded & audited
  const [hasRunAudit, setHasRunAudit] = useState<boolean>(false);

  // Mandate Registry State
  const [selectedFund, setSelectedFund] = useState<string>('EQT Infrastructure V');
  const [expectedIban, setExpectedIban] = useState<string>(KNOWN_FUNDS_REGISTRY['EQT Infrastructure V']);

  // Dynamic Notice State (populated strictly from user document upload)
  const [currentNoticeData, setCurrentNoticeData] = useState<NoticeExtraction | null>(null);

  const [activeTab, setActiveTab] = useState<'ledger' | 'wire' | 'json' | 'datev'>('ledger');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditHash, setAuditHash] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>(() =>
    new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
  );

  // Modal states for Pass/Fail animation & PDF certificate
  const [isPassFailModalOpen, setIsPassFailModalOpen] = useState<boolean>(false);
  const [isPdfCertModalOpen, setIsPdfCertModalOpen] = useState<boolean>(false);

  const handleSelectFund = (fundName: string, iban: string) => {
    setSelectedFund(fundName);
    setExpectedIban(iban);

    // Re-audit if notice already extracted
    if (currentNoticeData) {
      const res = auditNotice(currentNoticeData, iban ? { fund_name: fundName, iban } : null);
      setAuditResult(res);
      generateAuditHash(currentNoticeData, res).then((hash) => setAuditHash(hash));
    }
  };

  const handleRunAudit = (data: NoticeExtraction, mandateCheck?: { fund_name: string; iban: string } | null) => {
    setIsLoading(true);
    const activeCheck = mandateCheck || (expectedIban ? { fund_name: selectedFund, iban: expectedIban } : null);
    const res = auditNotice(data, activeCheck);

    setTimeout(() => {
      setCurrentNoticeData(data);
      setAuditResult(res);
      setTimestamp(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
      setHasRunAudit(true);
      setIsLoading(false);
      setIsPassFailModalOpen(true);

      generateAuditHash(data, res).then((hash) => setAuditHash(hash));
    }, 400);
  };

  return (
    <div className="relative min-h-screen text-slate-900 flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#06281C]">
      {/* 1. Interactive Illuminating Dot Grid Canvas */}
      <InteractiveDotGrid />

      {/* 2. Sovereign Header */}
      <Header />

      {/* 3. Main Operational Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-8">
        {/* Top Split Layout: Fund Mandate Registry Sidebar (Left) + Document Intake (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Fund Mandate Registry (Streamlit Sidebar Equivalent) */}
          <div className="lg:col-span-4 space-y-6">
            <MandateSidebar
              selectedFund={selectedFund}
              expectedIban={expectedIban}
              onSelectFund={handleSelectFund}
            />
          </div>

          {/* Right Column: Main Intake & Execution Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <DocumentIntake
              onRunAudit={handleRunAudit}
              isLoading={isLoading}
              selectedFund={selectedFund}
              expectedIban={expectedIban}
              hasProcessed={hasRunAudit}
            />
          </div>
        </div>

        {/* 4. Forensic Results & Audit Matrix: Revealed ONLY once document is parsed and audited */}
        {hasRunAudit && currentNoticeData && auditResult && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top KPI Ribbon (4 Metric Cards) & Alert Box (🚨 Errors / ⚠️ Warnings) */}
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
                  onClick={() => setActiveTab('json')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono-aurum font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'json'
                      ? 'bg-[#F5C542] text-[#06281C] shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Raw JSON Payload</span>
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
                  mandate={expectedIban ? { fund_name: selectedFund, iban: expectedIban, swift_bic: '' } : null}
                  audit={auditResult}
                />
              )}

              {activeTab === 'json' && (
                <CryptoReceiptTab
                  data={currentNoticeData}
                  audit={auditResult}
                  auditHash={auditHash}
                  timestamp={timestamp}
                />
              )}

              {activeTab === 'datev' && (
                <DatevEngineTab
                  data={currentNoticeData}
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
      {auditResult && currentNoticeData && (
        <PassFailModal
          isOpen={isPassFailModalOpen}
          onClose={() => setIsPassFailModalOpen(false)}
          audit={auditResult}
          data={currentNoticeData}
          onViewCertificate={() => setIsPdfCertModalOpen(true)}
        />
      )}

      {/* 6. Full Screen PDF Certificate Viewer & Downloader */}
      {auditResult && currentNoticeData && (
        <PdfCertificateModal
          isOpen={isPdfCertModalOpen}
          onClose={() => setIsPdfCertModalOpen(false)}
          data={currentNoticeData}
          audit={auditResult}
          auditHash={auditHash}
          timestamp={timestamp}
        />
      )}

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
