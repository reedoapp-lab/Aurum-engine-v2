import streamlit as st
import tempfile
import os
import json
import pandas as pd
from decimal import Decimal
import datetime

# Import the engine modules
from converter import pdf_to_base64_images
from extractor import extract_notice_data
from auditor import audit_notice
from sample_data import DEMO_NOTICES
from datev_engine import generate_datev_ledger, generate_audit_hash

# 1. Page Configuration
st.set_page_config(
    page_title="Aurum Ledger | Capital Call Auditor & Sovereign Engine",
    page_icon="⚜️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Institutional Styling Matching aurumledger.eu (Deep Obsidian & Sovereign Gold)
st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        /* Global App Canvas */
        .stApp {
            background-color: #07090e;
            color: #e2e8f0;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Sidebar Theme */
        section[data-testid="stSidebar"] {
            background-color: #0c1017;
            border-right: 1px solid rgba(212, 175, 55, 0.15);
        }

        section[data-testid="stSidebar"] h1, 
        section[data-testid="stSidebar"] h2, 
        section[data-testid="stSidebar"] h3 {
            color: #d4af37 !important;
            font-family: 'Cinzel', serif;
            letter-spacing: 0.05em;
        }

        /* Sovereign Header & Brand Badges */
        .aurum-header {
            background: linear-gradient(180deg, rgba(20, 26, 38, 0.95) 0%, rgba(11, 15, 23, 0.98) 100%);
            border: 1px solid rgba(212, 175, 55, 0.22);
            border-radius: 12px;
            padding: 24px 28px;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .aurum-title {
            font-family: 'Cinzel', serif;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #f5df97;
            text-transform: uppercase;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .aurum-subtitle {
            font-size: 13px;
            color: #94a3b8;
            letter-spacing: 0.04em;
            margin-top: 6px;
            font-weight: 400;
        }

        .compliance-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 14px;
        }

        .pill-gold {
            background: rgba(212, 175, 55, 0.1);
            border: 1px solid rgba(212, 175, 55, 0.3);
            color: #e5c07b;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 20px;
            letter-spacing: 0.04em;
            font-family: 'JetBrains Mono', monospace;
        }

        .pill-emerald {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #34d399;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 20px;
            letter-spacing: 0.04em;
            font-family: 'JetBrains Mono', monospace;
        }

        /* Metric Cards */
        .metric-card {
            background: #0f141f;
            border: 1px solid rgba(212, 175, 55, 0.18);
            border-radius: 10px;
            padding: 16px 18px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25);
            transition: all 0.2s ease;
        }
        .metric-card:hover {
            border-color: rgba(212, 175, 55, 0.4);
            transform: translateY(-1px);
        }
        .metric-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #8fa0b5;
            font-weight: 600;
            margin-bottom: 6px;
        }
        .metric-val {
            font-size: 22px;
            font-weight: 700;
            color: #f8fafc;
            font-family: 'JetBrains Mono', monospace;
        }
        .metric-val-gold {
            font-size: 22px;
            font-weight: 700;
            color: #f3e5ab;
            font-family: 'JetBrains Mono', monospace;
        }
        .metric-sub {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }

        /* Status Verification Banner */
        .status-badge-pass {
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.04) 100%);
            border: 1px solid rgba(16, 185, 129, 0.35);
            border-left: 4px solid #10b981;
            padding: 14px 18px;
            border-radius: 8px;
            color: #6ee7b7;
            font-weight: 500;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
        }

        .status-badge-fail {
            background: linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
            border: 1px solid rgba(239, 68, 68, 0.35);
            border-left: 4px solid #ef4444;
            padding: 14px 18px;
            border-radius: 8px;
            color: #fca5a5;
            font-weight: 500;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
        }

        .status-badge-warn {
            background: linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
            border: 1px solid rgba(245, 158, 11, 0.35);
            border-left: 4px solid #f59e0b;
            padding: 14px 18px;
            border-radius: 8px;
            color: #fcd34d;
            font-weight: 500;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
        }

        /* Buttons & Forms */
        div.stButton > button {
            background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%) !important;
            color: #07090e !important;
            font-weight: 700 !important;
            font-size: 14px !important;
            letter-spacing: 0.04em !important;
            border: 1px solid #f3e5ab !important;
            border-radius: 8px !important;
            padding: 10px 24px !important;
            box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25) !important;
            transition: all 0.2s ease !important;
        }
        div.stButton > button:hover {
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4) !important;
            transform: translateY(-1px) !important;
        }

        /* Streamlit Native Overrides */
        div[data-testid="stExpander"] {
            background-color: #0c1017;
            border: 1px solid rgba(212, 175, 55, 0.15);
            border-radius: 8px;
        }
        
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }
        .stTabs [data-baseweb="tab"] {
            background-color: transparent;
            color: #94a3b8;
            font-weight: 600;
            font-size: 13px;
            padding: 8px 16px;
            border-radius: 6px 6px 0 0;
            border: none;
        }
        .stTabs [aria-selected="true"] {
            background-color: rgba(212, 175, 55, 0.12) !important;
            color: #f3e5ab !important;
            border-bottom: 2px solid #d4af37 !important;
        }

        /* Table & Dataframe overrides */
        .stTable {
            background-color: #0d121c;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Code & Monospace styling */
        code, pre {
            font-family: 'JetBrains Mono', monospace !important;
            background-color: #06080c !important;
            border: 1px solid rgba(212, 175, 55, 0.12) !important;
            color: #e5c07b !important;
        }
    </style>
""", unsafe_allow_html=True)

# 3. Master Mandate Registry Configuration
KNOWN_MANDATES = {
    "EQT Infrastructure V": {
        "fund_legal_name": "EQT Infrastructure V (No.1) USD SCSp",
        "gp_entity": "EQT Fund Management S.à r.l.",
        "iban": "LU12345678901234567890",
        "swift_bic": "BILLULLX",
        "bank_name": "Banque Internationale à Luxembourg (BIL)",
        "currency": "EUR",
        "datev_konto_skr03": "0500",
        "datev_konto_skr04": "0800"
    },
    "Sequoia Capital US Growth": {
        "fund_legal_name": "Sequoia Capital Growth Fund VII LP",
        "gp_entity": "SC US Growth VII LLC",
        "iban": "US33CITI12345678901234",
        "swift_bic": "CITIUS33",
        "bank_name": "Citibank N.A., New York",
        "currency": "USD",
        "datev_konto_skr03": "0505",
        "datev_konto_skr04": "0805"
    },
    "Nordic Capital X": {
        "fund_legal_name": "Nordic Capital X Alpha LP",
        "gp_entity": "Nordic Capital Limited",
        "iban": "SE45500000000583982455",
        "swift_bic": "ESSESTMM",
        "bank_name": "Skandinaviska Enskilda Banken AB",
        "currency": "EUR",
        "datev_konto_skr03": "0500",
        "datev_konto_skr04": "0800"
    },
    "Apollo Hybrid Value II": {
        "fund_legal_name": "Apollo Hybrid Value Fund II EUR SCSp",
        "gp_entity": "Apollo Capital Management Europe LLP",
        "iban": "LU880000345678901234",
        "swift_bic": "SBILLULL",
        "bank_name": "State Street Bank International GmbH",
        "currency": "EUR",
        "datev_konto_skr03": "0500",
        "datev_konto_skr04": "0800"
    }
}

# 4. Sidebar: Sovereign Fund Mandate Registry
with st.sidebar:
    st.markdown("""
        <div style="text-align: center; padding: 12px 0 16px 0;">
            <div style="font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: #f5df97; letter-spacing: 0.08em;">
                AURUM LEDGER
            </div>
            <div style="font-size: 10px; color: #94a3b8; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 2px;">
                Sovereign Governance Engine
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown("### Master Mandate Registry")
    st.caption("Whitelisted bank coordinates & DATEV ledger mapping for institutional audit enforcement.")

    selected_fund = st.selectbox(
        "Select Active Fund Mandate",
        list(KNOWN_MANDATES.keys()),
        index=0
    )
    
    mandate_info = KNOWN_MANDATES[selected_fund]
    expected_iban = mandate_info["iban"]

    # Mandate Quick Card
    st.markdown(f"""
        <div style="background: #0f141f; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 8px; padding: 12px; margin-top: 10px;">
            <div style="font-size: 10px; text-transform: uppercase; color: #d4af37; font-weight: 700; letter-spacing: 0.05em;">
                Approved Baseline Mandate
            </div>
            <div style="font-size: 12px; color: #f8fafc; font-weight: 600; margin-top: 4px;">
                {mandate_info['fund_legal_name']}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                GP: {mandate_info['gp_entity']}
            </div>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 8px 0;">
            <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Whitelisted IBAN:</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6ee7b7; word-break: break-all; margin-top: 2px;">
                {expected_iban}
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; color: #94a3b8;">
                <span>SWIFT: <strong style="color:#e2e8f0;">{mandate_info['swift_bic']}</strong></span>
                <span>CCY: <strong style="color:#e2e8f0;">{mandate_info['currency']}</strong></span>
            </div>
        </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("### Institutional Enclave Status")
    st.markdown("""
        <div style="font-size: 11px; color: #94a3b8; line-height: 1.6;">
            <div>🛡️ <strong>Sovereign Node:</strong> Zürich-CH (Zero Trust)</div>
            <div>📜 <strong>Standards:</strong> ISO 27001 / SOC 2 Type II</div>
            <div>📑 <strong>Tax Interface:</strong> DATEV SKR03 / SKR04</div>
            <div>🔒 <strong>Verification:</strong> Modulo-97 & Forensic Hash</div>
        </div>
    """, unsafe_allow_html=True)


# 5. Main Hero & Institutional Header
st.markdown("""
    <div class="aurum-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
            <div>
                <h1 class="aurum-title">
                    <span>⚜️</span> AURUM ENGINE
                </h1>
                <div class="aurum-subtitle">
                    Sovereign Operating System for Capital Call Auditing, Private Capital Governance & DATEV Ledger Verification
                </div>
            </div>
            <div style="text-align: right;">
                <span class="pill-gold">SOVEREIGN CORE v2.4</span>
                <span class="pill-emerald">● ENCLAVE ACTIVE</span>
            </div>
        </div>
        <div class="compliance-pills">
            <span class="pill-gold">🏛️ LUXEMBOURG / GERMAN / SWISS GP MANDATES</span>
            <span class="pill-gold">⚖️ DETERMINISTIC ARITHMETIC RECONCILIATION</span>
            <span class="pill-emerald">🔍 MOD-97 IBAN FRAUD SENTINEL</span>
            <span class="pill-emerald">📊 AUDIT-PROOF DATEV BUCHUNGSZEILEN</span>
        </div>
    </div>
""", unsafe_allow_html=True)


# 6. Intake Engine: Upload PDF or Select Institutional Scenario
intake_col1, intake_col2 = st.columns([1.6, 1.4])

with intake_col1:
    st.markdown("#### 📁 Ingest Capital Call Document")
    st.caption("Upload incoming GP notices (PDF) to execute high-resolution OCR, arithmetic extraction, and bank coordinate checks.")
    uploaded_file = st.file_uploader("Upload Capital Call Notice (PDF)", type=["pdf"], label_visibility="collapsed")

with intake_col2:
    st.markdown("#### ⚡ Institutional Scenario Sandbox")
    st.caption("Select a pre-audited institutional notice to test the reconciliation engine immediately:")
    preset_choice = st.selectbox(
        "Institutional Sample Notices",
        ["-- Or Choose a Verified Demo Notice --"] + list(DEMO_NOTICES.keys()),
        label_visibility="collapsed"
    )
    if preset_choice != "-- Or Choose a Verified Demo Notice --":
        demo_info = DEMO_NOTICES[preset_choice]
        st.info(f"**Scenario**: {demo_info['description']}")


# Process Action Trigger
action_col1, action_col2, action_col3 = st.columns([2, 1, 1])

execute_audit = False
extracted_source = None

with action_col1:
    if st.button("⚜️ RUN SOVEREIGN AUDIT PIPELINE", type="primary", use_container_width=True):
        execute_audit = True

if execute_audit:
    with st.spinner("Executing Sovereign Audit: Neural Extraction, Modulo-97 Verification, and Balance Reconciliation..."):
        try:
            if uploaded_file is not None:
                # Save uploaded file
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                    tmp_file.write(uploaded_file.read())
                    tmp_pdf_path = tmp_file.name

                try:
                    # 1. Ingestion & Vision Conversion
                    base64_frames = pdf_to_base64_images(tmp_pdf_path)
                    
                    # 2. Semantic Extraction (Qwen2.5-VL)
                    data = extract_notice_data(base64_frames)
                finally:
                    if os.path.exists(tmp_pdf_path):
                        os.remove(tmp_pdf_path)

            elif preset_choice != "-- Or Choose a Verified Demo Notice --":
                # Load curated demo institutional notice
                demo_entry = DEMO_NOTICES[preset_choice]
                data = demo_entry["data"]
            else:
                # Default to clean EQT institutional notice if no PDF and no preset selected
                default_demo = DEMO_NOTICES["EQT Infrastructure V (Approved - Clean Audit)"]
                data = default_demo["data"]

            # 3. Deterministic Audit Checks
            mandate_check = {"fund_name": selected_fund, "iban": expected_iban}
            audit = audit_notice(data, mandate_check)
            
            # Store in session state
            st.session_state["data"] = data
            st.session_state["audit"] = audit
            st.session_state["processed"] = True
            st.session_state["timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

        except Exception as e:
            st.error(f"⚠️ Audit Execution Encountered an Issue: {str(e)}")
            st.info("Tip: If running live PDF OCR without Hugging Face API keys, you can select one of the pre-loaded Institutional Scenarios above to test the full audit and DATEV engine!")


# 7. Audit Results Workspace
if st.session_state.get("processed"):
    data = st.session_state["data"]
    audit = st.session_state["audit"]
    audit_hash = generate_audit_hash(data, audit)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("### 📊 Sovereign Audit Verification Report")

    # Status Banner
    if audit["math_passed"] and audit["wire_passed"]:
        st.markdown(f"""
            <div class="status-badge-pass">
                <span style="font-size: 20px;">🛡️</span>
                <div>
                    <strong>MANDATE & ARITHMETIC VERIFICATION: CERTIFIED & PASSED</strong><br>
                    <span style="font-size: 11px; opacity: 0.9;">All capital call components sum precisely to total due. Bank coordinates match whitelist registry {selected_fund}.</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
    elif not audit["wire_passed"]:
        st.markdown(f"""
            <div class="status-badge-fail">
                <span style="font-size: 20px;">🚨</span>
                <div>
                    <strong>CRITICAL WIRE INTEGRITY ALERT: DISCREPANCY DETECTED</strong><br>
                    <span style="font-size: 11px; opacity: 0.9;">Notice wiring coordinates deviate from approved mandate baseline. Do NOT execute automated wire transfer before manual CFO signoff.</span>
                </div>
            </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
            <div class="status-badge-warn">
                <span style="font-size: 20px;">⚠️</span>
                <div>
                    <strong>ARITHMETIC RECONCILIATION VARIANCE: FLAGGED</strong><br>
                    <span style="font-size: 11px; opacity: 0.9;">Discrepancy identified in fee/principal summation or historical commitment balances.</span>
                </div>
            </div>
        """, unsafe_allow_html=True)

    # Errors & Warnings Notification Stack
    if audit["errors"]:
        for err in audit["errors"]:
            st.error(f"🚨 {err}")
    if audit["warnings"]:
        for warn in audit["warnings"]:
            st.warning(f"⚠️ {warn}")

    # Top KPI Ribbon in Gold Institutional Cards
    kpi_col1, kpi_col2, kpi_col3, kpi_col4 = st.columns(4)

    with kpi_col1:
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Total Amount Due</div>
                <div class="metric-val-gold">{data.total_amount_due:,.2f} <span style="font-size: 14px; color: #d4af37;">{data.currency}</span></div>
                <div class="metric-sub">Drawdown Net Payable</div>
            </div>
        """, unsafe_allow_html=True)

    with kpi_col2:
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Wire Deadline</div>
                <div class="metric-val">{data.due_date}</div>
                <div class="metric-sub">Issued: {data.notice_date}</div>
            </div>
        """, unsafe_allow_html=True)

    with kpi_col3:
        called_pct = (data.prior_contributed + data.principal_call) / data.total_commitment * 100 if data.total_commitment > 0 else 0
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Cumulative Called</div>
                <div class="metric-val">{called_pct:.1f}%</div>
                <div class="metric-sub">Commitment: {data.total_commitment:,.0f} {data.currency}</div>
            </div>
        """, unsafe_allow_html=True)

    with kpi_col4:
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Uncalled Buffer</div>
                <div class="metric-val">{data.remaining_uncalled:,.2f}</div>
                <div class="metric-sub">{data.currency} Remaining Commitment</div>
            </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Detailed Institutional Tabbed Suite
    tab_breakdown, tab_wire, tab_datev, tab_crypto = st.tabs([
        "⚖️ Financial Breakdown & Math Ledger",
        "🏛️ Sovereign Wire Verification Matrix",
        "📑 DATEV General Ledger Engine (SKR03/04)",
        "🔒 Cryptographic Audit Trail & Raw Payload"
    ])

    # Tab 1: Financial Breakdown
    with tab_breakdown:
        b_col1, b_col2 = st.columns(2)

        with b_col1:
            st.markdown("##### 💵 Call Component Arithmetic Ledger")
            df_call = pd.DataFrame([
                {"Line Item": "Principal Investment Drawdown", "Amount": f"{data.principal_call:,.2f} {data.currency}"},
                {"Line Item": "Management Fee", "Amount": f"{data.management_fee:,.2f} {data.currency}"},
                {"Line Item": "Partnership Expenses / Legal / Admin", "Amount": f"{data.expenses:,.2f} {data.currency}"},
                {"Line Item": "Equalization / Late Interest", "Amount": f"{data.equalization_interest:,.2f} {data.currency}"},
                {"Line Item": "Recallable Distribution Drawn", "Amount": f"{data.recallable_capital:,.2f} {data.currency}"},
                {"Line Item": "Fee Offsets (Deductions)", "Amount": f"-{abs(data.fee_offsets):,.2f} {data.currency}"},
                {"Line Item": "══ TOTAL AMOUNT DUE ══", "Amount": f"{data.total_amount_due:,.2f} {data.currency}"}
            ])
            st.table(df_call)

        with b_col2:
            st.markdown("##### 📈 Investor Commitment & Runway")
            df_commit = pd.DataFrame([
                {"Metric": "Total LP Commitment", "Value": f"{data.total_commitment:,.2f} {data.currency}"},
                {"Metric": "Capital Contributed Prior to Call", "Value": f"{data.prior_contributed:,.2f} {data.currency}"},
                {"Metric": "Current Call Principal Applied", "Value": f"{data.principal_call:,.2f} {data.currency}"},
                {"Metric": "Remaining Unfunded Commitment", "Value": f"{data.remaining_uncalled:,.2f} {data.currency}"}
            ])
            st.table(df_commit)

            # Visual Commitment Progress
            if data.total_commitment > 0:
                prog_val = float(min(1.0, (data.prior_contributed + data.principal_call) / data.total_commitment))
                st.write(f"**Fund Capital Drawdown Status ({prog_val*100:.1f}%)**")
                st.progress(prog_val)

    # Tab 2: Sovereign Wire Verification Matrix
    with tab_wire:
        st.markdown("##### 🛡️ Coordinate Comparison: Notice vs Master Mandate Registry")
        
        notice_iban = (data.iban or data.account_number or "N/A").replace(" ", "").upper()
        clean_exp_iban = expected_iban.replace(" ", "").upper()
        iban_matches = (notice_iban == clean_exp_iban)

        w_col1, w_col2 = st.columns(2)

        with w_col1:
            st.markdown("**📄 Incoming Document Coordinates**")
            st.text_input("Beneficiary Name (Notice)", value=data.beneficiary_name, disabled=True)
            st.text_input("Beneficiary Bank (Notice)", value=data.bank_name, disabled=True)
            st.text_input("IBAN / Account (Notice)", value=notice_iban, disabled=True)
            st.text_input("SWIFT / BIC (Notice)", value=data.swift_bic, disabled=True)
            st.text_input("Payment Reference / Memo", value=data.payment_reference or "N/A", disabled=True)

        with w_col2:
            st.markdown(f"**🏛️ Approved Mandate Registry ({selected_fund})**")
            st.text_input("Approved Fund Legal Entity", value=mandate_info["fund_legal_name"], disabled=True)
            st.text_input("Approved Custodian Bank", value=mandate_info["bank_name"], disabled=True)
            st.text_input("Whitelisted IBAN", value=clean_exp_iban, disabled=True)
            st.text_input("Approved SWIFT / BIC", value=mandate_info["swift_bic"], disabled=True)
            st.text_input("Approved Currency", value=mandate_info["currency"], disabled=True)

        st.markdown("<br>", unsafe_allow_html=True)
        if iban_matches:
            st.success("✅ IBAN Match Verified: Notice wiring instructions match the approved master mandate registry.")
        else:
            st.error(f"❌ IBAN Mismatch Flag: Notice coordinates ({notice_iban}) do not match whitelisted mandate ({clean_exp_iban}).")

    # Tab 3: DATEV General Ledger Engine
    with tab_datev:
        st.markdown("##### 📑 DATEV General Ledger (Buchungsstapel) Engine")
        st.caption("Standardized accounting mapping for German & European Steuerberater, Family Offices, and Audit-Proof ERPs.")

        skr_choice = st.radio("Accounting Chart (Standardkontenrahmen)", ["SKR03", "SKR04"], horizontal=True)
        datev_df = generate_datev_ledger(data, skr_choice)

        st.dataframe(datev_df, use_container_width=True)

        # DATEV Export Button
        datev_csv = datev_df.to_csv(sep=";", index=False).encode("utf-8-sig")
        st.download_button(
            label=f"📥 Download DATEV-Format CSV ({skr_choice})",
            data=datev_csv,
            file_name=f"DATEV_Buchungsstapel_{data.notice_date}_{skr_choice}.csv",
            mime="text/csv",
            key="datev_download"
        )

    # Tab 4: Cryptographic Audit Trail
    with tab_crypto:
        st.markdown("##### 🔒 Cryptographic Certificate & Forensic Payload")
        st.markdown(f"""
            <div style="background: #06080c; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
                <div style="font-size: 11px; color: #d4af37; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                    Sovereign SHA-256 Audit Fingerprint
                </div>
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #6ee7b7; word-break: break-all; margin-top: 4px;">
                    {audit_hash}
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                    ISO 20022 Compliant • Swiss & EU Data Residency Article 9 Certified • Generated: {st.session_state.get('timestamp', 'N/A')}
                </div>
            </div>
        """, unsafe_allow_html=True)

        st.markdown("**Structured Extraction Payload (JSON)**")
        st.json(data.model_dump(mode="json"))

    # 8. Global Export Suite
    st.divider()
    st.markdown("#### 📤 Institutional Export Suite")
    exp_col1, exp_col2, exp_col3 = st.columns(3)

    # ERP Standard CSV
    export_dict = data.model_dump(mode="json")
    erp_csv = pd.DataFrame([export_dict]).to_csv(index=False).encode('utf-8')
    with exp_col1:
        st.download_button(
            label="📊 Download ERP-Ready CSV",
            data=erp_csv,
            file_name=f"Aurum_Capital_Call_{data.notice_date}.csv",
            mime="text/csv",
            use_container_width=True
        )

    # Certified JSON Audit Certificate
    audit_cert = {
        "aurum_engine_version": "2.4-sovereign",
        "audit_hash": audit_hash,
        "timestamp": st.session_state.get("timestamp"),
        "mandate_checked": selected_fund,
        "audit_results": audit,
        "extracted_payload": data.model_dump(mode="json")
    }
    cert_json = json.dumps(audit_cert, indent=2).encode('utf-8')
    with exp_col2:
        st.download_button(
            label="📜 Download Audit Certificate (JSON-LD)",
            data=cert_json,
            file_name=f"Aurum_Audit_Certificate_{data.notice_date}.json",
            mime="application/json",
            use_container_width=True
        )

    # DATEV Buchungsstapel
    with exp_col3:
        st.download_button(
            label="📑 Download DATEV Buchungsstapel",
            data=datev_csv,
            file_name=f"DATEV_Export_{data.notice_date}.csv",
            mime="text/csv",
            use_container_width=True
        )
