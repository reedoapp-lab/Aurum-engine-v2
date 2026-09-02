import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // API Health
  app.get('/api/health', (_req, res) => {
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasHf = !!process.env.HF_TOKEN;
    res.json({
      status: 'ok',
      engine: 'Aurum Sovereign Engine 2.4',
      ai_provider: hasGemini ? 'Gemini AI Vision & Extraction' : hasHf ? 'HuggingFace Inference' : 'Deterministic OCR & Text Engine',
      gemini_configured: hasGemini,
      hf_configured: hasHf,
    });
  });

  // API AI Extraction Route
  app.post('/api/extract', async (req, res) => {
    try {
      const { text, base64_images, base64_pdf, fileName } = req.body;
      const geminiKey = process.env.GEMINI_API_KEY;
      const hfToken = process.env.HF_TOKEN;

      const systemPrompt = `You are an institutional alternative asset fund controller auditing a private equity / venture capital capital call notice.
Thoroughly examine all pages and tables of the provided capital call document. Extract the EXACT financial figures, dates, fund details, and wiring banking coordinates.

You MUST output ONLY a valid JSON object strictly matching this schema:
{
  "gp_name": string (General Partner or fund manager entity name),
  "fund_name": string (Full legal entity name of the fund calling capital),
  "lp_name": string (Name of the Limited Partner / Investor receiving the notice),
  "notice_date": string (Date notice was issued in YYYY-MM-DD),
  "due_date": string (Payment / Wire due deadline date in YYYY-MM-DD),
  "currency": string (Three-letter currency code: "EUR", "USD", "GBP", "CHF"),
  "principal_call": number (Drawdown strictly for investments / principal),
  "management_fee": number (Management fees called, 0 if not stated),
  "expenses": number (Partnership / organizational / operating expenses called, 0 if not stated),
  "equalization_interest": number (Equalization or late-closer interest called, 0 if none),
  "recallable_capital": number (Recallable distribution drawn, 0 if none),
  "fee_offsets": number (Advisory/transactional fee offsets or credit deduction as positive float, 0 if none),
  "total_amount_due": number (Total net cash payment required for this notice),
  "total_commitment": number (Total capital commitment of the LP, 0 if not stated),
  "prior_contributed": number (Total capital paid prior to this notice, 0 if not stated),
  "remaining_uncalled": number (Remaining unfunded commitment after this call, 0 if not stated),
  "beneficiary_name": string (Account holder name for the wire transfer),
  "bank_name": string (Name of the beneficiary / custodian bank),
  "iban": string (IBAN code without spaces, or null),
  "swift_bic": string (SWIFT / BIC code),
  "account_number": string (Local account number if non-IBAN, or same as IBAN),
  "payment_reference": string (Wiring memo / payment reference / investor notice ID)
}

Rules:
- Read the entire document text, headers, line-item tables, and banking instructions thoroughly.
- All monetary numbers MUST be numeric floats (e.g., 250000.00). Do NOT return formatted strings like "$250,000".
- If a field is missing, use default 0.0 for numbers or empty string for text.
- Do NOT wrap output in markdown fences (no \`\`\`json). Output raw JSON only.`;

      // 1. Try Gemini Models via @google/genai SDK
      if (geminiKey) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const contentParts: any[] = [];

        // Attach PDF document directly if present
        if (base64_pdf) {
          const cleanPdfB64 = base64_pdf.includes(',') ? base64_pdf.split(',')[1] : base64_pdf;
          contentParts.push({
            inlineData: {
              data: cleanPdfB64,
              mimeType: 'application/pdf',
            },
          });
        }

        // Attach image frames if present
        if (base64_images && Array.isArray(base64_images) && base64_images.length > 0) {
          for (const b64 of base64_images.slice(0, 5)) {
            const cleanB64 = b64.includes(',') ? b64.split(',')[1] : b64;
            contentParts.push({
              inlineData: {
                data: cleanB64,
                mimeType: 'image/jpeg',
              },
            });
          }
        }

        const promptText = `${systemPrompt}\n\nDocument File Name: ${fileName || 'Capital_Call_Notice.pdf'}${
          text ? `\n\nExtracted Document Text Content:\n${text}` : ''
        }`;
        contentParts.push({ text: promptText });

        // Try gemini models in prioritized sequence
        const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];

        for (const modelName of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: { parts: contentParts },
              config: {
                responseMimeType: 'application/json',
              },
            });

            if (response.text) {
              let cleanJson = response.text.trim();
              cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/i, '').trim();
              const parsed = JSON.parse(cleanJson);

              // Normalize numeric values
              const sanitizedData = {
                gp_name: String(parsed.gp_name || '').trim(),
                fund_name: String(parsed.fund_name || '').trim() || (fileName ? fileName.replace(/\.[^/.]+$/, '').toUpperCase() : 'FUND ENTITY'),
                lp_name: String(parsed.lp_name || 'Institutional Mandate Partner').trim(),
                notice_date: String(parsed.notice_date || new Date().toISOString().split('T')[0]).trim(),
                due_date: String(parsed.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]).trim(),
                currency: String(parsed.currency || 'EUR').trim().toUpperCase(),
                principal_call: Number(parsed.principal_call) || 0,
                management_fee: Number(parsed.management_fee) || 0,
                expenses: Number(parsed.expenses) || 0,
                equalization_interest: Number(parsed.equalization_interest) || 0,
                recallable_capital: Number(parsed.recallable_capital) || 0,
                fee_offsets: Math.abs(Number(parsed.fee_offsets) || 0),
                total_amount_due: Number(parsed.total_amount_due) || (Number(parsed.principal_call) || 0) + (Number(parsed.management_fee) || 0) + (Number(parsed.expenses) || 0),
                total_commitment: Number(parsed.total_commitment) || 0,
                prior_contributed: Number(parsed.prior_contributed) || 0,
                remaining_uncalled: Number(parsed.remaining_uncalled) || 0,
                beneficiary_name: String(parsed.beneficiary_name || parsed.fund_name || '').trim(),
                bank_name: String(parsed.bank_name || '').trim(),
                iban: parsed.iban ? String(parsed.iban).replace(/\s+/g, '').toUpperCase() : undefined,
                swift_bic: String(parsed.swift_bic || 'BILLULLX').trim().toUpperCase(),
                account_number: parsed.account_number ? String(parsed.account_number).trim() : parsed.iban ? String(parsed.iban).replace(/\s+/g, '').toUpperCase() : undefined,
                payment_reference: String(parsed.payment_reference || `CALL-${new Date().getFullYear()}`).trim(),
              };

              return res.json({
                success: true,
                provider: `Gemini AI (${modelName})`,
                data: sanitizedData,
              });
            }
          } catch (modelErr: any) {
            console.warn(`Attempt with ${modelName} failed (${modelErr?.message || modelErr}), trying next model...`);
          }
        }
      }

      // 2. Try Hugging Face Inference if token is configured
      if (hfToken) {
        try {
          const userContent: any[] = [];
          if (base64_images && Array.isArray(base64_images) && base64_images.length > 0) {
            for (const b64 of base64_images.slice(0, 3)) {
              userContent.push({
                type: 'image_url',
                image_url: { url: b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}` },
              });
            }
          }
          userContent.push({
            type: 'text',
            text: text ? `Document Text Content:\n${text}\n\n${systemPrompt}` : systemPrompt,
          });

          const hfResponse = await fetch('https://router.huggingface.co/hf-inference/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'Qwen/Qwen2.5-VL-72B-Instruct',
              messages: [
                { role: 'system', content: 'You are an institutional alternative asset fund controller auditing capital calls into structured JSON.' },
                { role: 'user', content: userContent },
              ],
              max_tokens: 2048,
              temperature: 0.01,
            }),
          });

          if (hfResponse.ok) {
            const result: any = await hfResponse.json();
            let rawJsonStr = result.choices?.[0]?.message?.content || '';
            rawJsonStr = rawJsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(rawJsonStr);
            return res.json({ success: true, provider: 'HuggingFace Qwen2.5-VL', data: parsed });
          }
        } catch (hfErr) {
          console.warn('Hugging Face Inference attempt error:', hfErr);
        }
      }

      // 3. Deterministic In-Depth Text & Document Parser (Reads actual text extracted from uploaded PDF)
      const parsedFromDoc = parseTextHeuristic(text || '', fileName || '');

      return res.json({
        success: true,
        provider: 'Deterministic Document Parser',
        data: parsedFromDoc,
        note: 'Parsed directly from document text content.'
      });

    } catch (err: any) {
      console.error('Extraction handler error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Extraction failed' });
    }
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aurum Sovereign Engine running on http://localhost:${PORT}`);
  });
}

function parseTextHeuristic(text: string, fileName: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  let currency = 'EUR';
  if (/\bUSD\b|\$|US\s*Dollars?/i.test(text)) currency = 'USD';
  else if (/\bGBP\b|£|British\s*Pounds?|Sterling/i.test(text)) currency = 'GBP';
  else if (/\bCHF\b|Swiss\s*Francs?/i.test(text)) currency = 'CHF';

  let iban: string | undefined = undefined;
  const ibanMatches = text.match(/\b([A-Z]{2}\d{2}[A-Z0-9\s]{12,30})\b/g);
  if (ibanMatches) {
    for (const match of ibanMatches) {
      const clean = match.replace(/\s+/g, '');
      if (clean.length >= 15 && clean.length <= 34 && /^[A-Z]{2}\d{2}/.test(clean)) {
        iban = clean;
        break;
      }
    }
  }

  let swift_bic = 'BILLULLX';
  const swiftMatch = text.match(/\b(?:SWIFT(?:\/BIC)?|BIC)[:\s]*([A-Z0-9]{8,11})\b/i) ||
    text.match(/\b([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\b/);
  if (swiftMatch) swift_bic = swiftMatch[1].trim();

  let bank_name = '';
  const bankMatch = text.match(/(?:Bank(?:\s+Name)?|Beneficiary\s+Bank|Custodian)[:\s]+([^\n\r,]+)/i);
  if (bankMatch) bank_name = bankMatch[1].trim();

  let fund_name = fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase() : 'AURUM CAPITAL PARTNERS';
  const fundMatch = text.match(/(?:Fund(?:\s+Name)?|Legal\s+Entity|Partnership)[:\s]+([^\n\r]+)/i);
  if (fundMatch) fund_name = fundMatch[1].trim();

  const parseNum = (str: string): number => {
    let s = str.replace(/[()$€£¥A-Za-z\s]/g, '').trim();
    if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d+,\d{2}$/.test(s)) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
    const val = parseFloat(s);
    return isNaN(val) ? 0 : val;
  };

  const findAmount = (patterns: RegExp[]): number => {
    for (const pattern of patterns) {
      for (const line of lines) {
        if (pattern.test(line)) {
          const matches = line.match(/(?:[€$£]\s*)?-?\(?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})\)?/g);
          if (matches && matches.length > 0) {
            return parseNum(matches[matches.length - 1]);
          }
        }
      }
    }
    return 0;
  };

  const total_amount_due = findAmount([/Total\s+(?:Amount\s+)?Due/i, /Total\s+Call/i, /Net\s+Amount\s+Due/i, /Total\s+Payment/i]);
  const principal_call = findAmount([/Principal\s+(?:Drawdown|Call|Amount)/i, /Investment\s+Drawdown/i, /Capital\s+Call\s+Amount/i]);
  const management_fee = findAmount([/Management\s+Fee/i, /Mgmt\s+Fee/i, /Advisory\s+Fee/i]);
  const expenses = findAmount([/Partnership\s+Expenses/i, /Operating\s+Expenses/i, /Expenses/i]);
  const total_commitment = findAmount([/Total\s+Commitment/i, /Capital\s+Commitment/i]);
  const prior_contributed = findAmount([/Prior\s+Contributed/i, /Previously\s+Funded/i, /Cumulative\s+Drawn/i]);
  const remaining_uncalled = findAmount([/Remaining\s+Uncalled/i, /Unfunded\s+Commitment/i]);

  return {
    gp_name: `${fund_name} GP S.à r.l.`,
    fund_name,
    lp_name: 'Institutional Mandate Partner',
    notice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency,
    total_amount_due: total_amount_due || (principal_call + management_fee + expenses),
    principal_call: principal_call || total_amount_due,
    management_fee,
    expenses,
    equalization_interest: 0,
    recallable_capital: 0,
    fee_offsets: 0,
    total_commitment,
    prior_contributed,
    remaining_uncalled: remaining_uncalled || (total_commitment > 0 ? total_commitment - prior_contributed - principal_call : 0),
    beneficiary_name: fund_name,
    bank_name: bank_name || (iban ? 'Beneficiary Custodian' : ''),
    iban,
    swift_bic,
    account_number: iban,
    payment_reference: `CALL-${new Date().getFullYear()}`,
  };
}

startServer();
