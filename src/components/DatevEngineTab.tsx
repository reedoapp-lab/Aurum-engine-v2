import React, { useState } from 'react';
import { NoticeExtraction } from '../types';
import { generateDatevRows, buildCsvString } from '../lib/datev';
import { FileSpreadsheet, Download, CheckCircle, Copy, Check } from 'lucide-react';

interface DatevEngineTabProps {
  data: NoticeExtraction;
}

export const DatevEngineTab: React.FC<DatevEngineTabProps> = ({ data }) => {
  const [skrStandard, setSkrStandard] = useState<'SKR03' | 'SKR04'>('SKR03');
  const [copied, setCopied] = useState<boolean>(false);

  const rows = generateDatevRows(data, skrStandard);

  const handleDownloadDatevCsv = () => {
    const csvContent = buildCsvString(rows);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DATEV_Buchungsstapel_${data.notice_date}_${skrStandard}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyDatev = () => {
    const text = rows
      .map((r) => `${r.umsatz} | ${r.soll_haben} | Soll: ${r.konto} | Haben: ${r.gegenkonto} | ${r.buchungstext}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with SKR Selector */}
      <div className="royal-green-glass p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#F5C542]" />
            <h4 className="font-the-seasons font-bold text-lg text-white">
              DATEV General Ledger (Buchungsstapel) Engine
            </h4>
          </div>
          <p className="text-xs text-[#D1E7DD] mt-1 leading-relaxed max-w-xl">
            Automated double-entry accounting reconciliation for German & European Steuerberater, Family Offices, and Audit-Proof ERP systems.
          </p>
        </div>

        {/* Standard Selector */}
        <div className="flex items-center gap-1.5 bg-[#041A12] border border-[#D4AF37]/40 p-1.5 rounded-xl">
          <button
            onClick={() => setSkrStandard('SKR03')}
            className={`px-3.5 py-1.5 text-xs font-mono-aurum font-bold rounded-lg transition cursor-pointer ${
              skrStandard === 'SKR03'
                ? 'bg-[#F5C542] text-[#06281C] shadow-sm'
                : 'text-[#D1E7DD] hover:text-white'
            }`}
          >
            SKR03 (Standard)
          </button>
          <button
            onClick={() => setSkrStandard('SKR04')}
            className={`px-3.5 py-1.5 text-xs font-mono-aurum font-bold rounded-lg transition cursor-pointer ${
              skrStandard === 'SKR04'
                ? 'bg-[#F5C542] text-[#06281C] shadow-sm'
                : 'text-[#D1E7DD] hover:text-white'
            }`}
          >
            SKR04 (Abschluss)
          </button>
        </div>
      </div>

      {/* DATEV Buchungssatz Table */}
      <div className="royal-green-glass p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono-aurum text-[#F5E6B8] uppercase">
                  DATEV Postversand Journal ({skrStandard})
                </span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-mono-aurum font-bold">
                  FESTGESCHRIEBEN
                </span>
              </div>
              <span className="text-[10px] font-mono-aurum text-[#D1E7DD]">DATEV-FORMAT V7.0 KONTENRAHMEN</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDatev}
              className="flex items-center gap-1 bg-[#041A12] hover:bg-[#0A3D2B] text-[#D1E7DD] border border-white/10 hover:border-[#D4AF37]/40 px-2.5 py-1.5 rounded-lg text-[11px] font-mono-aurum transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Rows'}</span>
            </button>

            <button
              onClick={handleDownloadDatevCsv}
              className="flex items-center gap-1.5 bg-[#F5C542] hover:bg-[#FFE082] text-[#06281C] px-3.5 py-1.5 rounded-lg text-[11px] font-mono-aurum font-bold transition cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export DATEV Postversand CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#02120B]/90">
          <table className="w-full text-left text-xs border-collapse font-mono-aurum">
            <thead>
              <tr className="border-b border-[#D4AF37]/30 text-[#F5E6B8] text-[10px] uppercase bg-[#041A12]">
                <th className="py-3 px-3">Umsatz ({data.currency})</th>
                <th className="py-3 px-2">S/H</th>
                <th className="py-3 px-3">Konto (Soll)</th>
                <th className="py-3 px-3">Gegenkonto (Haben)</th>
                <th className="py-3 px-3">Belegdatum</th>
                <th className="py-3 px-3">Belegfeld 1</th>
                <th className="py-3 px-3 font-sans">Buchungstext</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-white/5 transition text-slate-100">
                  <td className="py-3 px-3 font-bold text-[#F5C542]">{r.umsatz}</td>
                  <td className="py-3 px-2 font-bold text-[#F5E6B8]">{r.soll_haben}</td>
                  <td className="py-3 px-3 text-white font-semibold">{r.konto}</td>
                  <td className="py-3 px-3 text-[#D1E7DD]">{r.gegenkonto}</td>
                  <td className="py-3 px-3 text-slate-300">{r.belegdatum}</td>
                  <td className="py-3 px-3 text-[#F5C542]">{r.belegfeld1}</td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-200">{r.buchungstext}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-400/30 font-bold">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
