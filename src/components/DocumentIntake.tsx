import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Play,
  RefreshCw,
  FileCode,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Binary,
  Landmark,
  Layers,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import { NoticeExtraction } from '../types';
import { readPdfThoroughly } from '../lib/pdfConverter';
import { parseNoticeFromText } from '../lib/documentParser';

interface DocumentIntakeProps {
  onRunAudit: (data: NoticeExtraction, mandateCheck?: { fund_name: string; iban: string } | null) => void;
  isLoading: boolean;
  selectedFund: string;
  expectedIban: string;
  hasProcessed: boolean;
}

export const DocumentIntake: React.FC<DocumentIntakeProps> = ({
  onRunAudit,
  isLoading,
  selectedFund,
  expectedIban,
  hasProcessed,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<NoticeExtraction | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
    setUploadedFileName(file.name);
    setFileSizeStr(formatFileSize(file.size));
    setErrorMsg(null);
  };

  const runAuditPipeline = async () => {
    if (!uploadedFile) {
      setErrorMsg('Please upload a Capital Call Notice (PDF or document) to run the audit pipeline.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setPipelineStep('1. Ingestion & Vision Conversion: Thoroughly parsing document pages & text...');

    try {
      let base64Pdf = '';
      let extractedText = '';
      let pageImages: string[] = [];

      if (uploadedFile.type === 'application/pdf' || uploadedFile.name.toLowerCase().endsWith('.pdf')) {
        const readResult = await readPdfThoroughly(uploadedFile);
        base64Pdf = readResult.base64Pdf;
        extractedText = readResult.extractedText;
        pageImages = readResult.pageImages;
      } else if (uploadedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        const b64Promise = new Promise<string>((res) => {
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });
        const img = await b64Promise;
        pageImages = [img];
      } else {
        // Plain text file
        extractedText = await uploadedFile.text();
      }

      setPipelineStep('2. Semantic Extraction: Reading line items, fees, commitments & bank coordinates...');

      let finalData: NoticeExtraction | null = null;

      try {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: uploadedFile.name,
            base64_pdf: base64Pdf,
            base64_images: pageImages,
            text: extractedText,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            finalData = resJson.data;
          }
        }
      } catch (apiErr) {
        console.warn('API extraction notice:', apiErr);
      }

      // If API was unavailable or missing fields, run deterministic document parser on the extracted text
      if (!finalData || !finalData.fund_name) {
        finalData = parseNoticeFromText(extractedText, uploadedFile.name);
      }

      setPipelineStep('3. Deterministic Audit Checks: Computing arithmetic reconciliation & Modulo-97 validation...');

      await new Promise((resolve) => setTimeout(resolve, 400));

      const mandateCheck = expectedIban
        ? { fund_name: selectedFund, iban: expectedIban }
        : null;

      setExtractedPreview(finalData);
      onRunAudit(finalData, mandateCheck);

    } catch (err: any) {
      console.error('Audit Pipeline Execution Error:', err);
      setErrorMsg(`Document processing failed: ${err.message || 'Unknown parsing error'}`);
    } finally {
      setIsProcessing(false);
      setPipelineStep('');
    }
  };

  return (
    <div className="royal-green-glass p-6 sm:p-7 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-aurum bg-[#F5C542]/20 text-[#F5E6B8] border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              DOCUMENT INTAKE & PARSER
            </span>
            <span className="text-[10px] text-emerald-400 font-mono-aurum flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Direct PDF Ingestion & Zero Stored Fallback
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Capital Call Notice Auditor
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
            Upload incoming GP notices to parse figures, verify arithmetic, and validate bank coordinates against approved mandates.
          </p>
        </div>

        {selectedFund && expectedIban && (
          <div className="bg-[#041A12]/90 border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono-aurum">Active Fund Mandate</div>
            <div className="text-xs font-bold text-[#F5E6B8] font-mono-aurum">{selectedFund}</div>
          </div>
        )}
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onClick={() => document.getElementById('aurum-notice-pdf-input')?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center cursor-pointer min-h-[190px] ${
          dragActive
            ? 'border-[#F5C542] bg-[#D4AF37]/15'
            : uploadedFileName
            ? 'border-emerald-400/60 bg-emerald-950/30'
            : 'border-[#D4AF37]/35 hover:border-[#F5C542] bg-[#041A12]/40 hover:bg-[#06281C]/60'
        }`}
      >
        <input
          id="aurum-notice-pdf-input"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        {isProcessing ? (
          <div className="space-y-3">
            <RefreshCw className="w-10 h-10 mx-auto animate-spin text-[#F5C542]" />
            <div className="text-sm font-bold text-[#F5E6B8] font-mono-aurum">
              {pipelineStep || 'Processing document: Converting pages, parsing structures, and running math checks...'}
            </div>
            <div className="text-xs text-slate-300">
              Reading notice line items, commitment balances, and wiring coordinates
            </div>
          </div>
        ) : uploadedFileName ? (
          <div className="space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-mono-aurum flex items-center justify-center gap-2">
                <span>{uploadedFileName}</span>
                <span className="text-xs text-slate-400 font-normal">({fileSizeStr})</span>
              </div>
              <div className="text-xs text-emerald-300 mt-0.5">
                ✓ Document ready for audit pipeline execution.
              </div>
            </div>
            <div className="text-[11px] text-slate-400 underline pt-1">
              Click or drop another file to replace
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0A3D2B]/80 text-[#F5C542] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <span className="text-base font-bold text-white block">
                Upload Capital Call Notice (PDF)
              </span>
              <span className="text-xs text-slate-300 block mt-1">
                Drag and drop your capital call document or click to browse
              </span>
            </div>
            <span className="inline-block text-[11px] font-mono-aurum bg-[#082A1D]/80 text-[#F5E6B8] px-3.5 py-1 rounded-full border border-[#D4AF37]/30">
              Full Multi-Page PDF Extraction • Modulo-97 Verification • CSV Ready
            </span>
          </div>
        )}
      </div>

      {/* Error Alert if validation fails */}
      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-500/60 rounded-xl p-4 flex items-start gap-3 text-rose-200 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-xs font-mono-aurum text-white uppercase tracking-wider">
              Processing Alert
            </div>
            <p className="text-xs text-rose-100 leading-relaxed">
              {errorMsg}
            </p>
          </div>
        </div>
      )}

      {/* Action Button: Run Audit Pipeline */}
      <div>
        <button
          onClick={runAuditPipeline}
          disabled={isProcessing || isLoading || !uploadedFile}
          className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 font-mono-aurum text-sm font-bold uppercase tracking-wider transition shadow-lg ${
            !uploadedFile
              ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-60'
              : 'gold-gradient-btn text-[#06281C] cursor-pointer hover:brightness-110 active:scale-[0.99]'
          }`}
        >
          {isProcessing || isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-[#06281C]" />
              <span>Running Audit Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-[#06281C] text-[#06281C]" />
              <span>Run Audit Pipeline</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
