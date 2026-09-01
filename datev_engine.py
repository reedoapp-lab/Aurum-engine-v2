import hashlib
import json
from decimal import Decimal
import pandas as pd
from schemas import NoticeExtraction

def generate_audit_hash(data: NoticeExtraction, audit_results: dict) -> str:
    """Generates a sovereign SHA-256 hash for forensic traceability."""
    payload_str = json.dumps({
        "fund": data.fund_name,
        "gp": data.gp_name,
        "amount": str(data.total_amount_due),
        "currency": data.currency,
        "notice_date": data.notice_date,
        "due_date": data.due_date,
        "iban": data.iban,
        "audit_math": audit_results.get("math_passed", False),
        "audit_wire": audit_results.get("wire_passed", False)
    }, sort_keys=True)
    return hashlib.sha256(payload_str.encode("utf-8")).hexdigest()

def generate_datev_ledger(data: NoticeExtraction, skr_standard: str = "SKR03") -> pd.DataFrame:
    """
    Generates audit-ready DATEV Buchungsstapel lines for German / European accounting standards.
    Supports SKR03 (Standardkontenrahmen 03) and SKR04 (Standardkontenrahmen 04).
    """
    if skr_standard == "SKR03":
        account_principal = "0500"   # Beteiligungen an Personengesellschaften / Fonds
        account_mgmt_fee = "4900"    # Sonstige betriebliche Aufwendungen / Fondsgebühren
        account_expenses = "4980"    # Betriebsbedarf / Nebenkosten des Geldverkehrs
        account_equalization = "2650"# Zinserträge / Zinsaufwendungen
        account_bank = "1200"        # Bankguthaben / Verrechnungskonto Auszahlungen
    else: # SKR04
        account_principal = "0800"   # Beteiligungen
        account_mgmt_fee = "6800"    # Fremdleistungen / Fondsmanagement
        account_expenses = "6850"    # Sonstige betriebliche Aufwendungen
        account_equalization = "7100"# Zinsen und ähnliche Aufwendungen
        account_bank = "1800"        # Bank

    formatted_date = data.due_date.replace("-", "")[4:8] if len(data.due_date) >= 10 else "0101"
    doc_ref = (data.payment_reference or "CAPCALL")[:36]

    rows = []

    # 1. Principal Drawdown Buchung
    if data.principal_call > 0:
        rows.append({
            "Umsatz (EUR)": f"{data.principal_call:,.2f}",
            "Soll/Haben": "S",
            "WKZ": data.currency,
            "Konto (Soll)": account_principal,
            "Gegenkonto (Haben)": account_bank,
            "Belegdatum": formatted_date,
            "Belegfeld 1": doc_ref,
            "Buchungstext": f"{data.fund_name[:20]} Principal Drawdown",
            "Status": "DATEV-Konform"
        })

    # 2. Management Fee Buchung
    if data.management_fee > 0:
        rows.append({
            "Umsatz (EUR)": f"{data.management_fee:,.2f}",
            "Soll/Haben": "S",
            "WKZ": data.currency,
            "Konto (Soll)": account_mgmt_fee,
            "Gegenkonto (Haben)": account_bank,
            "Belegdatum": formatted_date,
            "Belegfeld 1": doc_ref,
            "Buchungstext": f"{data.fund_name[:20]} Management Fee",
            "Status": "DATEV-Konform"
        })

    # 3. Partnership Expenses Buchung
    if data.expenses > 0:
        rows.append({
            "Umsatz (EUR)": f"{data.expenses:,.2f}",
            "Soll/Haben": "S",
            "WKZ": data.currency,
            "Konto (Soll)": account_expenses,
            "Gegenkonto (Haben)": account_bank,
            "Belegdatum": formatted_date,
            "Belegfeld 1": doc_ref,
            "Buchungstext": f"{data.fund_name[:20]} Expenses & Charges",
            "Status": "DATEV-Konform"
        })

    # 4. Equalization Interest Buchung
    if data.equalization_interest > 0:
        rows.append({
            "Umsatz (EUR)": f"{data.equalization_interest:,.2f}",
            "Soll/Haben": "S",
            "WKZ": data.currency,
            "Konto (Soll)": account_equalization,
            "Gegenkonto (Haben)": account_bank,
            "Belegdatum": formatted_date,
            "Belegfeld 1": doc_ref,
            "Buchungstext": f"{data.fund_name[:20]} Equalization Interest",
            "Status": "DATEV-Konform"
        })

    return pd.DataFrame(rows)
