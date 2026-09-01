from decimal import Decimal
from schemas import NoticeExtraction

DEMO_NOTICES = {
    "EQT Infrastructure V (Approved - Clean Audit)": {
        "description": "Standard EUR 1,250,000 drawdown with matching IBAN and exact arithmetic balance.",
        "mandate_fund": "EQT Infrastructure V",
        "data": NoticeExtraction(
            gp_name="EQT Fund Management S.à r.l.",
            fund_name="EQT Infrastructure V (No.1) USD SCSp",
            lp_name="Helvetia Wealth Stewardship SICAV",
            notice_date="2026-08-15",
            due_date="2026-09-05",
            principal_call=Decimal("1180000.00"),
            management_fee=Decimal("65000.00"),
            expenses=Decimal("5000.00"),
            equalization_interest=Decimal("0.00"),
            recallable_capital=Decimal("0.00"),
            fee_offsets=Decimal("0.00"),
            total_amount_due=Decimal("1250000.00"),
            total_commitment=Decimal("10000000.00"),
            prior_contributed=Decimal("4500000.00"),
            remaining_uncalled=Decimal("4320000.00"),
            currency="EUR",
            beneficiary_name="EQT Infrastructure V SCSp",
            bank_name="Banque Internationale à Luxembourg (BIL)",
            iban="LU12345678901234567890",
            swift_bic="BILLULLX",
            account_number=None,
            payment_reference="CALL-EQT-V-0826-HEL"
        )
    },
    "Nordic Capital X (Alert - Wire IBAN Discrepancy)": {
        "description": "Suspicious notice with altered wiring coordinates deviating from master mandate registry.",
        "mandate_fund": "Nordic Capital X",
        "data": NoticeExtraction(
            gp_name="Nordic Capital Limited",
            fund_name="Nordic Capital X Alpha LP",
            lp_name="Bavarian Private Capital GmbH",
            notice_date="2026-08-20",
            due_date="2026-09-02",
            principal_call=Decimal("820000.00"),
            management_fee=Decimal("40000.00"),
            expenses=Decimal("12500.00"),
            equalization_interest=Decimal("0.00"),
            recallable_capital=Decimal("0.00"),
            fee_offsets=Decimal("0.00"),
            total_amount_due=Decimal("872500.00"),
            total_commitment=Decimal("5000000.00"),
            prior_contributed=Decimal("2100000.00"),
            remaining_uncalled=Decimal("2080000.00"),
            currency="EUR",
            beneficiary_name="Nordic Cap X Accounts Dept",
            bank_name="Skandinaviska Enskilda Banken AB",
            iban="SE99500000000583982999", # Discrepancy vs SE45500000000583982455
            swift_bic="ESSESTMM",
            account_number=None,
            payment_reference="NCX-DRAW-2026-04"
        )
    },
    "Apollo Hybrid Value II (Complex Equalization & Fee Offset)": {
        "description": "Multi-tier call including advisory fee offsets and subsequent close equalization interest.",
        "mandate_fund": "Apollo Hybrid Value II",
        "data": NoticeExtraction(
            gp_name="Apollo Capital Management Europe LLP",
            fund_name="Apollo Hybrid Value Fund II EUR SCSp",
            lp_name="Zürich Family Office Multi-Asset AG",
            notice_date="2026-08-28",
            due_date="2026-09-12",
            principal_call=Decimal("2400000.00"),
            management_fee=Decimal("120000.00"),
            expenses=Decimal("15000.00"),
            equalization_interest=Decimal("12500.00"),
            recallable_capital=Decimal("0.00"),
            fee_offsets=Decimal("25000.00"), # Offset discount
            total_amount_due=Decimal("2522500.00"), # 2400k + 120k + 15k + 12.5k - 25k = 2522.5k
            total_commitment=Decimal("15000000.00"),
            prior_contributed=Decimal("6200000.00"),
            remaining_uncalled=Decimal("6400000.00"),
            currency="EUR",
            beneficiary_name="Apollo Hybrid Value Fund II EUR",
            bank_name="State Street Bank International GmbH, Luxembourg Branch",
            iban="LU880000345678901234",
            swift_bic="SBILLULL",
            account_number=None,
            payment_reference="APOLLO-HV2-CALL-09"
        )
    }
}
