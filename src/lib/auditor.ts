import { NoticeExtraction, MandateRecord, AuditResult } from '../types';

/**
 * Validates international IBAN checksum using the standard ISO 7064 Modulo 97-10 algorithm (equivalent to Python schwifty IBAN)
 */
export function validateIBANChecksum(iban: string): { valid: boolean; error?: string } {
  if (!iban) return { valid: false, error: 'IBAN is required' };
  const clean = iban.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  if (clean.length < 15 || clean.length > 34) {
    return { valid: false, error: `Invalid IBAN character length (${clean.length})` };
  }

  // Country code format check (2 uppercase letters)
  const countryCode = clean.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return { valid: false, error: 'Invalid country code prefix' };
  }

  // Move first 4 characters to the end
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      numericString += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      numericString += rearranged[i];
    } else {
      return { valid: false, error: 'Contains illegal characters' };
    }
  }

  // Perform modulo 97 in chunks to avoid numeric overflow
  let remainder = 0;
  for (let i = 0; i < numericString.length; i += 7) {
    const part = remainder.toString() + numericString.substring(i, i + 7);
    remainder = parseInt(part, 10) % 97;
  }

  if (remainder === 1) {
    return { valid: true };
  } else {
    return { valid: false, error: `Modulo 97 checksum failed (remainder = ${remainder}, expected 1)` };
  }
}

/**
 * Deterministic audit logic strictly matching Python auditor.py
 */
export function auditNotice(data: NoticeExtraction, preApprovedMandate?: MandateRecord | { fund_name?: string; iban?: string } | null): AuditResult {
  const auditResults: AuditResult = {
    math_passed: true,
    wire_passed: true,
    commitment_reconciled: true,
    calculated_call: 0,
    discrepancy_amount: 0,
    errors: [],
    warnings: [],
    iban_valid_checksum: true,
    mandate_matched: true,
  };

  // 1. Arithmetic: Total Call = Principal + Fees + Expenses + Equalization + Recallable - abs(Fee Offsets)
  const principal = Number(data.principal_call) || 0;
  const mgmtFee = Number(data.management_fee) || 0;
  const expenses = Number(data.expenses) || 0;
  const equalization = Number(data.equalization_interest) || 0;
  const recallable = Number(data.recallable_capital) || 0;
  const feeOffsets = Math.abs(Number(data.fee_offsets) || 0);

  const calculatedCall = Number((principal + mgmtFee + expenses + equalization + recallable - feeOffsets).toFixed(2));
  auditResults.calculated_call = calculatedCall;

  const totalStated = Number((Number(data.total_amount_due) || 0).toFixed(2));
  const diff = Number(Math.abs(calculatedCall - totalStated).toFixed(2));
  auditResults.discrepancy_amount = diff;

  if (calculatedCall !== totalStated) {
    if (diff <= 0.02) {
      auditResults.warnings.push(`Minor rounding variance detected: ${diff.toFixed(2)} ${data.currency}`);
    } else {
      auditResults.math_passed = false;
      auditResults.errors.push(
        `Arithmetic Mismatch: Sum of items (${calculatedCall.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${data.currency}) != Total Stated (${totalStated.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${data.currency})`
      );
    }
  }

  // 2. Arithmetic: Total Commitment Reconciliation Check
  const priorContributed = Number(data.prior_contributed) || 0;
  const remainingUncalled = Number(data.remaining_uncalled) || 0;
  const totalCommitment = Number(data.total_commitment) || 0;
  const reconciledCommitment = Number((priorContributed + principal + remainingUncalled).toFixed(2));

  if (totalCommitment > 0 && reconciledCommitment !== totalCommitment) {
    auditResults.commitment_reconciled = false;
    auditResults.warnings.push(
      `Commitment reconciliation offset: Expected ${totalCommitment.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Calculated ${reconciledCommitment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    );
  }

  // 3. Wire Validation: IBAN Checksum (using Modulo-97)
  if (data.iban) {
    const cleanIban = data.iban.replace(/\s+/g, '').toUpperCase();
    const ibanCheck = validateIBANChecksum(cleanIban);
    if (!ibanCheck.valid) {
      auditResults.wire_passed = false;
      auditResults.iban_valid_checksum = false;
      auditResults.errors.push(`Invalid IBAN format/checksum: ${ibanCheck.error || 'Invalid checksum'}`);
    }
  }

  // 4. Fraud Prevention: Baseline Mandate Verification
  if (preApprovedMandate && preApprovedMandate.iban && data.iban) {
    const cleanIban = data.iban.replace(/\s+/g, '').toUpperCase();
    const expectedIban = preApprovedMandate.iban.replace(/\s+/g, '').toUpperCase();

    if (expectedIban && cleanIban !== expectedIban) {
      auditResults.wire_passed = false;
      auditResults.mandate_matched = false;
      auditResults.errors.push(
        `CRITICAL WIRE ALERT: Notice IBAN (${cleanIban}) does NOT match approved baseline mandate (${expectedIban}).`
      );
    }
  }

  return auditResults;
}
