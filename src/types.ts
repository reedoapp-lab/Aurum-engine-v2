export interface NoticeExtraction {
  gp_name: string;
  fund_name: string;
  lp_name: string;
  notice_date: string;
  due_date: string;
  
  // Financial breakdown
  principal_call: number;
  management_fee: number;
  expenses: number;
  equalization_interest: number;
  recallable_capital: number;
  fee_offsets: number;
  total_amount_due: number;
  
  // Historical / Commitment context
  total_commitment: number;
  prior_contributed: number;
  remaining_uncalled: number;
  
  // Wire Coordinates
  currency: string;
  beneficiary_name: string;
  bank_name: string;
  iban?: string;
  swift_bic: string;
  account_number?: string;
  payment_reference?: string;
}

export interface MandateRecord {
  id: string;
  mandate_id?: string;
  fund_name: string;
  fund_legal_name: string;
  gp_entity: string;
  domicile: string;
  currency: string;
  iban: string;
  swift_bic: string;
  bank_name: string;
  custodian_city: string;
  datev_konto_skr03: string;
  datev_konto_skr04: string;
  max_drawdown_limit: number;
  total_commitment?: number;
  active: boolean;
}

export interface AuditResult {
  math_passed: boolean;
  wire_passed: boolean;
  commitment_reconciled: boolean;
  calculated_call: number;
  discrepancy_amount: number;
  errors: string[];
  warnings: string[];
  iban_valid_checksum: boolean;
  mandate_matched: boolean;
}

export interface DatevRow {
  umsatz: string;
  soll_haben: "S" | "H";
  wkz: string;
  konto: string;
  gegenkonto: string;
  belegdatum: string;
  belegfeld1: string;
  buchungstext: string;
  status: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  badge: "APPROVED" | "FLAGGED_WIRE" | "COMPLEX_OFFSETS";
  description: string;
  mandate_id: string;
  data: NoticeExtraction;
}
