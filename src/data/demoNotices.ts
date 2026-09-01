import { DemoScenario } from '../types';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'eqt-clean',
    title: 'EQT Infrastructure V — Clean Institutional Notice',
    badge: 'APPROVED',
    description: 'Flawless €1,250,000 drawdown with exact math, verified BIL Luxembourg IBAN, and reconciled commitment.',
    mandate_id: 'eqt-infra-v',
    data: {
      gp_name: 'EQT Fund Management S.à r.l.',
      fund_name: 'EQT Infrastructure V (No.1) USD SCSp',
      lp_name: 'Helvetia Wealth Stewardship SICAV',
      notice_date: '2026-08-15',
      due_date: '2026-09-05',
      principal_call: 1180000.00,
      management_fee: 65000.00,
      expenses: 5000.00,
      equalization_interest: 0.00,
      recallable_capital: 0.00,
      fee_offsets: 0.00,
      total_amount_due: 1250000.00,
      total_commitment: 10000000.00,
      prior_contributed: 4500000.00,
      remaining_uncalled: 4320000.00,
      currency: 'EUR',
      beneficiary_name: 'EQT Infrastructure V SCSp',
      bank_name: 'Banque Internationale à Luxembourg (BIL)',
      iban: 'LU12345678901234567890',
      swift_bic: 'BILLULLX',
      payment_reference: 'CALL-EQT-V-0826-HEL'
    }
  },
  {
    id: 'nordic-discrepancy',
    title: 'Nordic Capital X — Fraud Sentinel IBAN Mismatch',
    badge: 'FLAGGED_WIRE',
    description: 'Simulated man-in-the-middle / altered invoice attack with tampered wire routing coordinates.',
    mandate_id: 'nordic-cap-x',
    data: {
      gp_name: 'Nordic Capital Limited',
      fund_name: 'Nordic Capital X Alpha LP',
      lp_name: 'Bavarian Private Capital GmbH',
      notice_date: '2026-08-20',
      due_date: '2026-09-02',
      principal_call: 820000.00,
      management_fee: 40000.00,
      expenses: 12500.00,
      equalization_interest: 0.00,
      recallable_capital: 0.00,
      fee_offsets: 0.00,
      total_amount_due: 872500.00,
      total_commitment: 5000000.00,
      prior_contributed: 2100000.00,
      remaining_uncalled: 2080000.00,
      currency: 'EUR',
      beneficiary_name: 'Nordic Cap X External Collections',
      bank_name: 'Skandinaviska Enskilda Banken AB',
      iban: 'SE99500000000583982999', // Altered IBAN vs SE45500000000583982455
      swift_bic: 'ESSESTMM',
      payment_reference: 'NCX-DRAW-2026-04'
    }
  },
  {
    id: 'apollo-complex',
    title: 'Apollo Hybrid Value II — Equalization & Fee Offset',
    badge: 'COMPLEX_OFFSETS',
    description: 'Multi-tiered institutional call with subsequent closer interest, transaction fee rebates, and split tranches.',
    mandate_id: 'apollo-hybrid-ii',
    data: {
      gp_name: 'Apollo Capital Management Europe LLP',
      fund_name: 'Apollo Hybrid Value Fund II EUR SCSp',
      lp_name: 'Zürich Family Office Multi-Asset AG',
      notice_date: '2026-08-28',
      due_date: '2026-09-12',
      principal_call: 2400000.00,
      management_fee: 120000.00,
      expenses: 15000.00,
      equalization_interest: 12500.00,
      recallable_capital: 0.00,
      fee_offsets: 25000.00,
      total_amount_due: 2522500.00,
      total_commitment: 15000000.00,
      prior_contributed: 6200000.00,
      remaining_uncalled: 6400000.00,
      currency: 'EUR',
      beneficiary_name: 'Apollo Hybrid Value Fund II EUR',
      bank_name: 'State Street Bank International GmbH, Luxembourg',
      iban: 'LU880000345678901234',
      swift_bic: 'SBILLULL',
      payment_reference: 'APOLLO-HV2-CALL-09'
    }
  }
];
