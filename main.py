import json
from converter import pdf_to_base64_images
from extractor import extract_notice_data
from auditor import audit_notice

def process_capital_call(pdf_path: str, client_mandate: dict = None) -> dict:
    print(f"[*] Processing document: {pdf_path}")
    
    # 1. Convert to high-res images
    images = pdf_to_base64_images(pdf_path)
    
    # 2. Extract structured fields
    print("[*] Running semantic extraction...")
    extracted_data = extract_notice_data(images)
    
    # 3. Audit arithmetic and bank parameters
    print("[*] Executing deterministic audit...")
    audit_report = audit_notice(extracted_data, client_mandate)
    
    # 4. Generate final certified payload
    payload = {
        "status": "APPROVED" if (audit_report["math_passed"] and audit_report["wire_passed"]) else "FLAGGED",
        "extracted_data": extracted_data.model_dump(mode="json"),
        "audit_report": audit_report
    }
    
    return payload

if __name__ == "__main__":
    # Test mandate representing a verified historical record for this fund
    known_fund_mandate = {
        "fund_name": "Alpha Buyout Fund IV",
        "iban": "DE89370400440532013000"
    }
    
    # Execute
    result = process_capital_call("sample_notice.pdf", known_fund_mandate)
    print(json.dumps(result, indent=2))