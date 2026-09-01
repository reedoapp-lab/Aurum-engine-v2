from decimal import Decimal
from schwifty import IBAN
from schemas import NoticeExtraction

def audit_notice(data: NoticeExtraction, pre_approved_mandate: dict | None = None) -> dict:
    audit_results = {
        "math_passed": True,
        "wire_passed": True,
        "errors": [],
        "warnings": []
    }
    
    # 1. Arithmetic: Total Call = Principal + Fees + Expenses
    calculated_call = calculated_call = (
    data.principal_call 
    + data.management_fee 
    + data.expenses 
    + data.equalization_interest 
    + data.recallable_capital 
    - abs(data.fee_offsets)
)
    if calculated_call != data.total_amount_due:
        diff = abs(calculated_call - data.total_amount_due)
        if diff <= Decimal("0.02"):
            audit_results["warnings"].append(f"Minor rounding variance detected: {diff} {data.currency}")
        else:
            audit_results["math_passed"] = False
            audit_results["errors"].append(
                f"Arithmetic Mismatch: Sum of items ({calculated_call}) != Total Stated ({data.total_amount_due})"
            )

    # 2. Arithmetic: Total Commitment Reconciliation Check
    reconciled_commitment = data.prior_contributed + data.principal_call + data.remaining_uncalled
    if data.total_commitment > 0 and reconciled_commitment != data.total_commitment:
        audit_results["warnings"].append(
            f"Commitment reconciliation offset: Expected {data.total_commitment}, Calculated {reconciled_commitment}"
        )

    # 3. Wire Validation: IBAN Checksum
    if data.iban:
        clean_iban = data.iban.replace(" ", "").upper()
        try:
            IBAN(clean_iban)
        except ValueError as e:
            audit_results["wire_passed"] = False
            audit_results["errors"].append(f"Invalid IBAN format/checksum: {str(e)}")

    # 4. Fraud Prevention: Baseline Mandate Verification
    if pre_approved_mandate and data.iban:
        clean_iban = data.iban.replace(" ", "").upper()
        expected_iban = pre_approved_mandate.get("iban", "").replace(" ", "").upper()
        
        if clean_iban != expected_iban:
            audit_results["wire_passed"] = False
            audit_results["errors"].append(
                f"CRITICAL WIRE ALERT: Notice IBAN ({clean_iban}) does NOT match approved baseline mandate ({expected_iban})."
            )

    return audit_results