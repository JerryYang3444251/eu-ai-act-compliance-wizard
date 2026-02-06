# NECESSARY MODIFICATIONS — PRIORITIZED ACTION LIST
**Status: Analysis Complete — No Implementation Yet**
**Last Updated: February 5, 2026**

---

## CRITICAL MODIFICATIONS (Must implement for spec compliance)

### 1. Screen2_Role — Multi-Role Determination + Reclassification
**Why:** Current single-role selection violates Module 2 (ROLE_001-007) and Module 2B (ROLE_RECLASS_001-013)  
**What to change:**
- Replace radio-button single select with **checkboxes** for org_actions:
  - [ ] Develop AI system
  - [ ] Modify/improve system
  - [ ] Brand/rename system
  - [ ] Place on market
  - [ ] Import into EU
  - [ ] Distribute/resell
  - [ ] Deploy/use system
- Add logic validation: At least one action must be selected (Rule ROLE_007)
- Store in context as `roles_raw[]` (captured actions)

**Implementation detail:** Add Module 2B reclassification engine in WizardContext that applies ROLE_RECLASS_001-013 to convert roles_raw[] → roles[] (legal roles)

---

### 2. WizardContext — Implement Module 2B Legal Role Reclassification
**Why:** Spec requires converting org_actions (what user does) to legal roles (what spec defines)  
**What to add:**
- New function: `reclassifyRoles(roles_raw, answers)` implementing:
  - ROLE_RECLASS_001: develop/modify → Provider
  - ROLE_RECLASS_002: brand → Provider
  - ROLE_RECLASS_003: place_on_market → Provider
  - ROLE_RECLASS_004: (product manufacturer + safety component) → Provider
  - ROLE_RECLASS_005: (importer + brand) → Provider
  - ROLE_RECLASS_006: (distributor + brand) → Provider
  - ROLE_RECLASS_007: (deployer + modifications) → Provider
  - ROLE_RECLASS_008-010: Keep as-is if conditions not met
  - ROLE_RECLASS_011: Deduplicate roles array
  - ROLE_RECLASS_012: Error if roles empty
  - ROLE_RECLASS_013: Display computed roles
- Store `roles[]` separately from `roles_raw[]`
- Export `roles` from context (not `role`)

---

### 3. Expand checklist.js — Add Complete Obligation Definitions (A1-O50)
**Why:** Screen15_Checklist needs to display all applicable obligations per Module 11  
**What to add:**
- Provider obligations: A1 (Risk Management) through A16 (Cooperation)
- Handover obligations: C1-C15 (documentation handover)
- Importer obligations: D1-D14
- Distributor obligations: E1-E9
- Deployer obligations: F1-F12
- FRIA obligations: G1-G15
- Transparency obligations: H1-H9
- Non-Significant Risk obligations: I1-I7
- GPAI obligations: J1-J16
- GPAI-Systemic obligations: K1-K13
- Prohibited obligations: L1-L9
- Exclusion (no obligations): M1-M4 (informational only)
- Product Manufacturer: N1-N4
- Conformity Assessment: O1-O50 (by route: Internal Control, Notified Body, Common Specs, Sectoral Law)

**Format example:**
```javascript
export const OBLIGATIONS = {
  Provider: {
    A1: {
      title: "Risk Management System",
      articles: ["Article 9", "Annex IV"],
      items: ["Identify known risks", "Identify foreseeable risks", ...]
    },
    A2: { ... }
  },
  Importer: { D1: {...}, D2: {...}, ... },
  // ... etc
}
```

---

### 4. WizardContext — Implement Module 11 Obligation Engine
**Why:** Obligations must be computed based on role + classification + route per Rules OBL_001-011  
**What to add:**
- New function: `computeObligations(roles, classification, conformityRoute, answers)` that:
  - Rule OBL_001-004: Add role-specific obligations (Provider, Importer, Distributor, Deployer)
  - Rule OBL_005-006: Add GPAI/GPAI-Systemic obligations if classification matches
  - Rule OBL_007: Add Conformity Assessment obligations if high-risk + route determined
  - Rule OBL_008: Add Transparency (H1-H9) if transparency_triggers[] not empty
  - Rule OBL_009: Add FRIA (G1-G15) if is_public_body AND high-risk
  - Rule OBL_010: Add Non-Sig-Risk (I1-I7) if classification == ANNEX_III_NON_SIGNIFICANT
  - Rule OBL_011: Add Prohibited (L1-L9) if classification == PROHIBITED
- Output: obligations[] = array of obligation category codes (A, C, D, E, F, G, H, I, J, K, L, N, O + route)
- Store in context as `obligations`

---

### 5. Update Screen15_Checklist — Render Computed Obligations
**Why:** Currently displays generic checklist; must render Module 11-computed obligations with articles  
**What to change:**
- Receive `obligations` array from context
- Loop through each obligation category in obligations[]
- Render obligation definitions with:
  - Title (e.g., "A1: Risk Management System")
  - Article citations (e.g., "Article 9, Annex IV")
  - Checklist items (e.g., "Identify known risks", "Identify foreseeable risks", ...)
  - Checkbox completion tracking per item
- Group by obligation category (A, C, D, E, F, G, H, I, J, K, L, N, O)

---

## HIGH PRIORITY MODIFICATIONS (Significant functional gaps)

### 6. Screen3_AnnexIA — Add Safety Function Question + Conditional Routing
**Why:** Spec Rule A1A_002-003 requires secondary question determining next screen  
**What to change:**
- After Annex IA category selection, add question:
  - "Does this AI system perform a safety function in the product?"
  - [ ] Yes, safety function
  - [ ] No, not a safety function
- Store in context as `answers.safety_function`
- Conditional navigation:
  - If safety_function == "yes" → navigate to `/screen8` (GPAI-Systemic)
  - If safety_function == "no" → navigate to `/screen7` (GPAI)
- Rule reference: A1A_002 (yes) and A1A_003 (no)

---

### 7. Screen5_AnnexIII — Implement Rule A3_001 Gating
**Why:** If no Annex III use-cases selected, system should skip Part 9 (Prohibited) and go directly to classification  
**What to change:**
- Current logic: If Annex III == none → navigate `/screen7` (GPAI)
- New logic: If Annex III == none → set classification to IN_SCOPE_NON_HIGH_RISK AND navigate `/screen9` (Prohibited)
- Rule reference: A3_001

---

### 8. Screen6_SignificantRisk (Part 6) — Refactor to Match Spec Impact Checks
**Why:** Current input structure (12+8 items) doesn't match spec's 11-item impact_checks[] from Rule A3_IMPACT_001  
**What to change:**
- Simplify inputs to spec's 11 impact criteria:
  - Decision basis for third parties
  - Decision constraining autonomous systems
  - Unverifiable output
  - Access to entitlements
  - Profiling effects
  - Harm/safety risk
  - Disadvantage/discrimination risk
  - Opacity limiting oversight
  - Automation bias risk
  - Law enforcement special handling
  - Migration/border special handling
- Update classification logic:
  - Rule A3_IMPACT_001: If ANY impact item selected → HIGH_RISK_III
  - Rule A3_IMPACT_002: If ONLY "none" → ANNEX_III_NON_SIGNIFICANT
  - Rule A3_IMPACT_003: Error if "none" + others (mutual exclusivity)

---

### 9. Add is_public_body Input Question
**Why:** Spec Rule FRIA_001 requires explicit is_public_body flag to gate FRIA obligations  
**What to change:**
- Add question to Screen2_Role or Screen10_Transparency (whichever makes sense contextually)
- Question: "Is your organization a public body?"
  - [ ] Yes
  - [ ] No
- Store in context as `answers.is_public_body`
- Use in FRIA gating logic (Part 11 screen) and obligation trigger (Module 11 rule OBL_009)

---

### 10. Screen8b_GPAI-Systemic — Add FLOPS Input + Rules GPAI_003-004
**Why:** Spec Rules GPAI_003-004 require FLOPS >= 10^25 check to determine systemic risk classification  
**What to change:**
- Add input field: "Model computational capacity (FLOPS)" with numeric input
- Store in context as `answers.flopsValue`
- Implement classification logic:
  - Rule GPAI_003: If FLOPS >= 10^25 → add classification GPAI_SYSTEMIC_RISK
  - Rule GPAI_004: If FLOPS < 10^25 → add classification GPAI (non-systemic)
- Display conditional warning if systemic risk detected

---

### 11. Add safety_function Answer Key to WizardContext
**Why:** STEP_ORDER/ANSWER_KEYS_BY_STEP needs to track safety_function for back-button clearing  
**What to change:**
- Add `/screen3` entry to ANSWER_KEYS_BY_STEP: `["annexIACategories", "safety_function"]`
- Update STEP_ORDER if Part 3 answers key changed

---

## MEDIUM PRIORITY MODIFICATIONS (Refinements)

### 12. Implement Module 9 Conditional Routing (Rule CLASS_001)
**Why:** Classification screen should route conditionally: high-risk → CA-Route, else → Checklist  
**What to change:**
- In Screen12_FinalClassification handleNext():
  ```javascript
  if ([HIGH_RISK_IA, HIGH_RISK_IB, HIGH_RISK_III, GPAI_SYSTEMIC].includes(finalClassification)) {
    navigate("/screen13"); // CA Route
  } else {
    navigate("/screen15"); // Checklist
  }
  ```
- Remove gating logic from Screen13_ConformityRoute (let Module 9 filter before arriving)

---

### 13. Data Verification — Confirm Exact Spec Alignment
**What to check:**
- [ ] EXCLUSIONS in checklist.js == [military, R&D_only, opensource_free, personal_use, foreign_LE_only]
- [ ] CLASSIFICATIONS enum includes all 10 types from spec
- [ ] ANNEX_IA_CATEGORIES map to product safety frameworks
- [ ] ANNEX_III_USECASES represent use-cases from Article 6(3)
- [ ] HIGH_RISK_SECTORS_B match Annex I Section B
- [ ] PROHIBITED_PRACTICES match Article 5
- [ ] CONFORMITY_ASSESSMENT_ROUTES == {Sectoral_Law, Common_Specs, Internal_Control, Notified_Body}

---

### 14. Add Article Citations to Obligation Display
**Why:** Spec includes Article references; users need to know source of each obligation  
**What to add:**
- Each obligation definition includes `articles` property with list of relevant articles
- Display in Screen15_Checklist with obligation (e.g., "Article 9, Annex IV")

---

### 15. Transparency Obligation Trigger (Rule OBL_008)
**Why:** If transparency_triggers[] selected, must add Transparency obligations (H1-H9)  
**What to change:**
- In Module 11 obligation engine:
  ```javascript
  if (answers.transparencyTriggers && answers.transparencyTriggers.some(t => t !== "none")) {
    obligations.push("Transparency"); // Add H1-H9
  }
  ```

---

### 16. Non-Significant Risk Obligation Trigger (Rule OBL_010)
**Why:** If Annex III non-significant classification, must add notification obligations (I1-I7)  
**What to change:**
- In Module 11 obligation engine:
  ```javascript
  if (classification === CLASSIFICATIONS.ANNEX_III_NON_SIGNIFICANT) {
    obligations.push("NonSignificantRisk"); // Add I1-I7
  }
  ```

---

## LOW PRIORITY MODIFICATIONS (Enhancements)

### 17. Screen4_AnnexIB — Review Navigation Path
**Why:** Spec Rule A1B_001-002 navigation intent needs clarification  
**What to review:**
- Current: Always goes to /screen5 (Annex III Use-Cases)
- Question: Should high-risk Annex IB systems skip Annex III? Verify against spec flow diagram

---

### 18. Implement Advanced Role Reclassification (Rules ROLE_RECLASS_004-010)
**Why:** Module 2B has conditional role reclassification based on additional factors  
**What to add:**
- ROLE_RECLASS_004: Check if product manufacturer + AI is safety component → Provider
- ROLE_RECLASS_005: Check if importer + placing under own name → Provider
- ROLE_RECLASS_006: Check if distributor + placing under own name → Provider
- ROLE_RECLASS_007: Check if deployer + modifications (substantial, purpose change, etc.) → Provider
- Add supporting input screens or integrate into Part 2 role determination

---

### 19. Enhanced Output/Export Functionality
**Why:** Users need structured output for compliance documentation  
**What to add:**
- PDF export of obligations checklist with articles and items
- Print-friendly formatting
- Structured data export (JSON) for integration with other systems
- Organization by obligation category with visual indicators

---

### 20. Implement Product Manufacturer Path (Rules N1-N4)
**Why:** Spec includes Product Manufacturer obligations not yet addressed  
**What to add:**
- If user is product_manufacturer AND AI is safety component → trigger Provider path
- Display Product Manufacturer-specific obligations (N1-N4)
- Integrate with conformity assessment obligations

---

## VALIDATION CHECKLIST

Before marking complete, verify:

- [ ] Part 2 role determination captures all 7 org_actions and implements all Module 2B rules
- [ ] WizardContext correctly computes roles[] from roles_raw[]
- [ ] Obligation engine (Module 11) applies all Rules OBL_001-011 correctly
- [ ] checklist.js has complete A1-O50 obligation definitions with Article citations
- [ ] Screen15 displays all applicable obligations grouped by category
- [ ] safety_function question in Part 3 routes correctly to Part 8 vs Part 7
- [ ] is_public_body question exists and gates FRIA correctly
- [ ] FLOPS input in Part 8b implements Rules GPAI_003-004
- [ ] Part 12 routes conditionally per Rule CLASS_001
- [ ] Part 6 (Significant Risk) uses spec's 11 impact criteria
- [ ] All EXCLUSIONS, CLASSIFICATIONS, and other enums match spec exactly
- [ ] Article citations display throughout

---

**Total modifications identified: 20**  
**Critical: 5 | High: 6 | Medium: 5 | Low: 4**

