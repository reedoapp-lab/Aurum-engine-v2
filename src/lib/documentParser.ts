import { NoticeExtraction } from '../types';

/**
 * Clean and parse monetary numeric values from string text
 * Handles formats like: "$1,250,000.00", "€ 1.250.000,50", "1250000.00", "(50,000.00)", "EUR 450,000"
 */
export function parseCurrencyAmount(raw: string | number | undefined | null): number {
  if (typeof raw === 'number') return isNaN(raw) ? 0 : Number(raw.toFixed(2));
  if (!raw || typeof raw !== 'string') return 0;

  let str = raw.trim();
  const isNegative = str.startsWith('(') && str.endsWith(')') || str.startsWith('-');
  // Remove currency symbols, parentheses, letters, and extraneous spaces
  str = str.replace(/[()$€£¥A-Za-z\s]/g, '').trim();

  // If European format with dots as thousand separators and comma as decimal: e.g. 1.250.000,50
  if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (/^\d+,\d{2}$/.test(str)) {
    str = str.replace(',', '.');
  } else {
    // Standard format: remove commas e.g. 1,250,000.00 -> 1250000.00
    str = str.replace(/,/g, '');
  }

  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  const result = isNegative ? -Math.abs(num) : num;
  return Number(result.toFixed(2));
}

/**
 * Extract ISO date YYYY-MM-DD from various date formats (e.g., 2026-09-16, 16/09/2026, September 16, 2026, 16.09.2026)
 */
export function parseDateString(raw: string | undefined | null): string {
  if (!raw || typeof raw !== 'string') return new Date().toISOString().split('T')[0];
  const text = raw.trim();

  // 1. YYYY-MM-DD
  const isoMatch = text.match(/\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // 2. DD.MM.YYYY or DD/MM/YYYY
  const euMatch = text.match(/\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d{2})\b/);
  if (euMatch) return `${euMatch[3]}-${euMatch[2]}-${euMatch[1]}`;

  // 3. Month Name DD, YYYY or DD Month YYYY
  const monthNames: { [key: string]: string } = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };

  const textMonthMatch = text.match(/\b([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b/i);
  if (textMonthMatch) {
    const m = monthNames[textMonthMatch[1].toLowerCase()];
    if (m) {
      const d = textMonthMatch[2].padStart(2, '0');
      return `${textMonthMatch[3]}-${m}-${d}`;
    }
  }

  const dMonthMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\s+(20\d{2})\b/i);
  if (dMonthMatch) {
    const m = monthNames[dMonthMatch[2].toLowerCase()];
    if (m) {
      const d = dMonthMatch[1].padStart(2, '0');
      return `${dMonthMatch[3]}-${m}-${d}`;
    }
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Deterministically parses raw capital call document text into a structured NoticeExtraction
 * Searches for institutional financial headers, tables, lines, bank IBANs, and amounts.
 */
export function parseNoticeFromText(rawText: string, fileName?: string): NoticeExtraction {
  const text = rawText || '';
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  // 1. Detect Currency
  let currency = 'EUR';
  if (/\bUSD\b|\$|US\s*Dollars?/i.test(text)) currency = 'USD';
  else if (/\bGBP\b|£|British\s*Pounds?|Sterling/i.test(text)) currency = 'GBP';
  else if (/\bCHF\b|Swiss\s*Francs?/i.test(text)) currency = 'CHF';
  else if (/\bEUR\b|€|Euros?/i.test(text)) currency = 'EUR';

  // 2. Detect IBAN & Bank Coordinates
  let iban = '';
  // Standard IBAN regex (2 letters + 2 digits + up to 30 alphanumeric)
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

  // SWIFT/BIC regex (8 or 11 chars: 4 bank + 2 country + 2 location + optional 3 branch)
  let swift_bic = '';
  const swiftMatch = text.match(/\b(?:SWIFT(?:\/BIC)?|BIC)[:\s]*([A-Z0-9]{8,11})\b/i) ||
    text.match(/\b([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\b/);
  if (swiftMatch) {
    swift_bic = swiftMatch[1].trim();
  }

  // Bank Name
  let bank_name = '';
  const bankMatch = text.match(/(?:Bank(?:\s+Name)?|Beneficiary\s+Bank|Custodian)[:\s]+([^\n\r,]+)/i);
  if (bankMatch) {
    bank_name = bankMatch[1].trim();
  }

  // Beneficiary Name
  let beneficiary_name = '';
  const benMatch = text.match(/(?:Beneficiary(?:\s+Name)?|Account\s+Name|Payable\s+to|In\s+favour\s+of)[:\s]+([^\n\r,]+)/i);
  if (benMatch) {
    beneficiary_name = benMatch[1].trim();
  }

  // Payment Reference / Memo
  let payment_reference = '';
  const refMatch = text.match(/(?:Payment\s+Reference|Reference|Memo|Investor\s+ID|Wire\s+Ref|Remittance\s+Info)[:\s]+([A-Za-z0-9\-_/]+)/i);
  if (refMatch) {
    payment_reference = refMatch[1].trim();
  }

  // 3. Detect Fund Name & GP Name & LP Name
  let fund_name = '';
  const fundMatch = text.match(/(?:Fund(?:\s+Name)?|Legal\s+Entity|Partnership)[:\s]+([^\n\r]+)/i) ||
    text.match(/\b([A-Z0-9\s.,&'-]+(?:Fund|Capital|Partners|Investments|Ventures|Infrastructure|Buyout|Holdings)(?:\s+(?:[IVXLCDM]+|\d+|LP|SCSp|LLC|SICAV))?)\b/i);
  if (fundMatch) {
    fund_name = fundMatch[1].trim();
  } else if (fileName) {
    fund_name = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase();
  } else {
    fund_name = 'AURUM CAPITAL PARTNERS';
  }

  let gp_name = '';
  const gpMatch = text.match(/(?:General\s+Partner|GP|Manager|Management\s+Company)[:\s]+([^\n\r]+)/i);
  if (gpMatch) gp_name = gpMatch[1].trim();
  else gp_name = `${fund_name} GP S.à r.l.`;

  let lp_name = '';
  const lpMatch = text.match(/(?:Limited\s+Partner|LP|Investor|Attention|Dear|To)[:\s]+([^\n\r]+)/i);
  if (lpMatch) lp_name = lpMatch[1].trim();
  else lp_name = 'Institutional Mandate Partner';

  // 4. Dates
  let notice_date = new Date().toISOString().split('T')[0];
  const noticeDateMatch = text.match(/(?:Notice\s+Date|Date\s+of\s+Notice|Issue\s+Date|Date)[:\s]+([^\n\r]+)/i);
  if (noticeDateMatch) {
    notice_date = parseDateString(noticeDateMatch[1]);
  }

  let due_date = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const dueDateMatch = text.match(/(?:Due\s+Date|Payment\s+Due|Payment\s+Date|Value\s+Date|Remittance\s+Deadline|Settlement\s+Date)[:\s]+([^\n\r]+)/i);
  if (dueDateMatch) {
    due_date = parseDateString(dueDateMatch[1]);
  }

  // 5. Line Items & Amounts
  // Helper to find amount near label
  const findAmountForKeywords = (keywords: RegExp[]): number => {
    for (const kw of keywords) {
      for (const line of lines) {
        if (kw.test(line)) {
          // Look for currency amounts on this line or adjacent
          const amounts = line.match(/(?:[€$£]\s*)?-?\(?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})\)?/g);
          if (amounts && amounts.length > 0) {
            const lastAmount = amounts[amounts.length - 1];
            return Math.abs(parseCurrencyAmount(lastAmount));
          }
        }
      }
    }
    return 0;
  };

  const total_amount_due = findAmountForKeywords([
    /Total\s+(?:Amount\s+)?Due/i,
    /Total\s+Call\s+Amount/i,
    /Net\s+Amount\s+Due/i,
    /Total\s+Payment\s+Due/i,
    /Total\s+Drawdown/i,
    /Total\s+Payable/i,
  ]);

  const principal_call = findAmountForKeywords([
    /Principal\s+(?:Drawdown|Call|Amount|Investment)/i,
    /Investment\s+Drawdown/i,
    /Capital\s+Call\s+Amount/i,
    /Investment\s+Amount/i,
  ]);

  const management_fee = findAmountForKeywords([
    /Management\s+Fee/i,
    /Mgmt\s+Fee/i,
    /Advisory\s+Fee/i,
  ]);

  const expenses = findAmountForKeywords([
    /Partnership\s+Expenses/i,
    /Operating\s+Expenses/i,
    /Expenses/i,
    /Organizational\s+Expenses/i,
    /Other\s+Expenses/i,
  ]);

  const equalization_interest = findAmountForKeywords([
    /Equalization\s+Interest/i,
    /Late\s+Closer\s+Interest/i,
    /Equalisation/i,
  ]);

  const recallable_capital = findAmountForKeywords([
    /Recallable\s+Capital/i,
    /Recallable\s+Distribution/i,
  ]);

  const fee_offsets = findAmountForKeywords([
    /Fee\s+Offset/i,
    /Fee\s+Discount/i,
    /Offset\s+Credit/i,
  ]);

  const total_commitment = findAmountForKeywords([
    /Total\s+Commitment/i,
    /Capital\s+Commitment/i,
    /Committed\s+Capital/i,
    /Total\s+Fund\s+Commitment/i,
  ]);

  const prior_contributed = findAmountForKeywords([
    /Prior\s+Contributed/i,
    /Previously\s+Funded/i,
    /Cumulative\s+Drawn/i,
    /Prior\s+Calls/i,
    /Cumulative\s+Contributions/i,
  ]);

  const remaining_uncalled = findAmountForKeywords([
    /Remaining\s+Uncalled/i,
    /Unfunded\s+Commitment/i,
    /Remaining\s+Commitment/i,
    /Available\s+Commitment/i,
  ]);

  return {
    gp_name,
    fund_name,
    lp_name,
    notice_date,
    due_date,
    currency,
    total_amount_due: total_amount_due || (principal_call + management_fee + expenses),
    principal_call: principal_call || total_amount_due,
    management_fee,
    expenses,
    equalization_interest,
    recallable_capital,
    fee_offsets,
    total_commitment,
    prior_contributed,
    remaining_uncalled: remaining_uncalled || (total_commitment > 0 ? total_commitment - prior_contributed - principal_call : 0),
    beneficiary_name: beneficiary_name || fund_name,
    bank_name: bank_name || (iban ? 'Beneficiary Bank' : ''),
    iban: iban || undefined,
    swift_bic: swift_bic || 'BILLULLX',
    account_number: iban || undefined,
    payment_reference: payment_reference || `CALL-${new Date().getFullYear()}-INV`,
  };
}
