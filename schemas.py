from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

class NoticeExtraction(BaseModel):
    gp_name: str = Field(description="Name of the General Partner / Fund Manager")
    fund_name: str = Field(description="Full legal entity name of the fund calling capital")
    lp_name: str = Field(description="Name of the LP / Investor receiving the notice")
    notice_date: str = Field(description="Date notice was issued (YYYY-MM-DD)")
    due_date: str = Field(description="Wire deadline date (YYYY-MM-DD)")
    
    # Financial breakdown
    principal_call: Decimal = Field(description="Drawdown amount strictly for investments/principal")
    management_fee: Decimal = Field(default=Decimal("0.0"), description="Management fees called")
    expenses: Decimal = Field(default=Decimal("0.0"), description="Partnership or organizational expenses")
    total_amount_due: Decimal = Field(description="Total cash due for this specific notice")
    
    # Historical / Commitment context
    total_commitment: Decimal = Field(description="Total capital commitment of the LP")
    prior_contributed: Decimal = Field(description="Total capital paid by LP prior to this call")
    remaining_uncalled: Decimal = Field(description="Remaining unfunded commitment after this call")
    
    # Wire Coordinates
    currency: str = Field(description="Three-letter currency code (e.g., EUR, USD)")
    beneficiary_name: str = Field(description="Account holder name for the transfer")
    bank_name: str = Field(description="Name of the beneficiary bank")
    iban: Optional[str] = Field(None, description="IBAN code if European wire")
    swift_bic: str = Field(description="SWIFT/BIC code")
    account_number: Optional[str] = Field(None, description="Local account number if non-IBAN")
    payment_reference: Optional[str] = Field(None, description="Wiring memo, investor ID, or payment reference")

    equalization_interest: Decimal = Field(default=Decimal("0.0"), description="Equalization or late-closer interest")
    recallable_capital: Decimal = Field(default=Decimal("0.0"), description="Recallable distribution amount drawn")
    fee_offsets: Decimal = Field(default=Decimal("0.0"), description="Advisory or transactional fee offsets (negative/discount)")