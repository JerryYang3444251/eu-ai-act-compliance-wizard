# Test Plan: Part 11 (FRIA) High-Risk Scenario Validation

## Objective
Verify that Part 11 (Screen11b_FRIA) correctly determines FRIA requirement based on:
1. Public body status (is_public_body: true/false)
2. System classification (must be HIGH_RISK_IA, HIGH_RISK_IB, or HIGH_RISK_III)

## Test Scenarios

### Group 1: HIGH-RISK IA (Product Safety)
**Path**: Part 1 (None) → Part 2 (Any role) → Part 3 (Select product_laws + safety_function=yes)

#### Test 1.1: High-Risk IA + Public Body
- **Setup**: 
  - Part 1: Select "None of the above"
  - Part 2: Select any org_action
  - Part 3: Select a product safety category + answer "yes" to safety function
  - Part 11: Select "Yes, we are a public body/authority"
- **Expected Result**: 
  - Banner title: "⚠️ FRIA Required"
  - Message: Mentions "public body" and "high-risk AI system"
  - Next button navigates to Part 12

#### Test 1.2: High-Risk IA + Private Organization
- **Setup**: Same as 1.1 but Part 11: Select "No, we are a private organization"
- **Expected Result**: 
  - Banner title: "ℹ️ Public Body Selected" should NOT appear
  - No banner at all (only the question)
  - Next button navigates to Part 12

---

### Group 2: HIGH-RISK IB (Regulated Sectors)
**Path**: Part 1 (None) → Part 2 (Any role) → Part 3 (None) → Part 4 (Select regulated_sectors)

#### Test 2.1: High-Risk IB + Public Body
- **Setup**: 
  - Part 4: Select any regulated sector
  - Part 11: Select "Yes, we are a public body/authority"
- **Expected Result**: 
  - Banner: "⚠️ FRIA Required"
  - Message references high-risk AI system and public body

#### Test 2.2: High-Risk IB + Private Organization
- **Setup**: Same as 2.1 but select "No"
- **Expected Result**: No banner displayed

---

### Group 3: HIGH-RISK III (Annex III with Significant Impact)
**Path**: Part 1 (None) → Part 2 (Any role) → Part 3 (None) → Part 4 (None) → Part 5 (Select use-cases) → Part 6 (Select significant impacts)

#### Test 3.1: High-Risk III + Public Body
- **Setup**: 
  - Part 5: Select any Annex III use-case
  - Part 6: Select any significant impact criterion (at least one)
  - Part 11: Select "Yes, we are a public body/authority"
- **Expected Result**: 
  - Banner: "⚠️ FRIA Required"

#### Test 3.2: High-Risk III + Private Organization
- **Setup**: Same as 3.1 but select "No"
- **Expected Result**: No banner displayed

---

### Group 4: HIGH-RISK III (No Significant Impact)
**Path**: Part 1 (None) → Part 2 → Part 3-4 (None) → Part 5 (Select use-cases) → Part 6 (Select "none_of_the_above")

#### Test 4.1: Non-High-Risk (Annex III, No Sig Impact) + Public Body
- **Setup**: 
  - Part 5: Select Annex III use-case
  - Part 6: Select "None of the above"
  - Classification should be: "AnnexIII_non_significant_risk"
  - Part 11: Select "Yes, we are a public body/authority"
- **Expected Result**: 
  - Banner title: "ℹ️ Public Body Selected"
  - Message: "FRIA is only required for public bodies deploying high-risk systems. Your system classification does not trigger FRIA obligations."

#### Test 4.2: Same as 4.1 + Private Organization
- **Expected Result**: No banner displayed

---

### Group 5: GPAI Classification
**Path**: Part 1 (None) → Part 2 → Parts 3-6 (Non-high-risk path) → Part 7 (Select is_gpai=true) → Part 8 (Set FLOPS)

#### Test 5.1: GPAI (Non-High-Risk) + Public Body
- **Setup**: 
  - Part 7: Select "Yes, is GPAI"
  - Part 8: Set FLOPS < 1e25 (regular GPAI, not systemic)
  - Part 11: Select "Yes, we are a public body/authority"
- **Expected Result**: No banner displayed (GPAI is not high-risk)

#### Test 5.2: GPAI Systemic (High-Risk) + Public Body
- **Setup**: 
  - Part 8: Set FLOPS >= 1e25 (systemic risk)
  - Classification should be: "GPAI_systemic_risk"
  - Part 11: Select "Yes, we are a public body/authority"
- **Expected Result**: No banner (GPAI Systemic is not in the high-risk list for FRIA)

---

### Group 6: Classification Precedence
**Path**: Trigger multiple classifications and verify HIGH_RISK takes precedence

#### Test 6.1: Prohibited Practice (should skip FRIA entirely)
- **Setup**: 
  - Part 9: Select any prohibited practice
  - Expected navigation: Should go to /screenFinal (not Part 10-11)
- **Expected Result**: Part 11 is never reached

#### Test 6.2: Excluded System (should skip FRIA entirely)
- **Setup**: 
  - Part 1: Select a top-5 exclusion
  - Expected navigation: Should go to /screenFinal
- **Expected Result**: Part 11 is never reached

---

## Console Logging to Verify

In all tests, check browser console for debug log from Screen11b_FRIA:
```
Screen11b_FRIA - Classification check: {
  classification: "high_risk_ib" | "high_risk_ia" | "high_risk_iii",
  isHighRisk: true | false,
  isPublicBody: true | false,
  friaRequired: true | false,
  ...
}
```

Expected values:
- **Test 1.1, 2.1, 3.1**: `friaRequired: true`
- **Test 1.2, 2.2, 3.2, 4.1, 5.1**: `friaRequired: false`
- **Test 4.1**: `isHighRisk: false`
- **Test 5.2**: `isHighRisk: false` (GPAI Systemic not in high-risk list)

---

## Validation Checklist

For each test group, verify:

- [ ] Correct classification set (check console log)
- [ ] Correct `isHighRisk` boolean (true only for HIGH_RISK_IA/IB/III)
- [ ] Banner displays only when `isPublicBody === true`
- [ ] Banner title matches condition:
  - "⚠️ FRIA Required" when `friaRequired === true`
  - "ℹ️ Public Body Selected" when `friaRequired === false` but `isPublicBody === true`
- [ ] No banner when `isPublicBody === false`
- [ ] Navigation to Part 12 works correctly
- [ ] "Next" button requires public body selection before proceeding

---

## Notes

- Global precedence system ensures HIGH_RISK classifications persist through flow
- FRIA is ONLY required when BOTH conditions are met:
  1. `isPublicBody === true`
  2. `classification === "high_risk_ia" | "high_risk_ib" | "high_risk_iii"`
- Classification check uses context `classification` state, NOT `answers.classification`
- GPAI and GPAI_Systemic are NOT considered "high-risk" for FRIA purposes
