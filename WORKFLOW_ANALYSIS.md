# System Workflow Analysis vs. Modular Rules Engine Specification
**Date: February 5, 2026**
**Status: Analysis Complete - No implementations performed**

---

## EXECUTIVE SUMMARY

The current system implements a simplified linear flow with 15 screens. The comprehensive modular rules engine specification defines a much more sophisticated rule-based system with:
- **12 core modules** (vs current implicit flow)
- **Multi-role determination** with legal reclassification (current: single-role selection)
- **Conditional gating** based on role + classification combinations (current: minimal gating)
- **Detailed obligation mapping** by role + route combinations (current: partial obligation logic)

**Overall Assessment:** The system requires significant restructuring to fully comply with the specification. However, the 15-screen structure provides a reasonable foundation.

---

## DETAILED DISCREPANCY ANALYSIS

### MODULE 1 — EXCLUSIONS ✅ PARTIALLY ALIGNED

**Spec Requirement:**
- Rule EXCL_001: If ANY exclusion flag present → classification = "Excluded" → SCREEN_FINAL
- Rule EXCL_002: If NO exclusion flags → proceed to SCREEN_2

**Current Implementation:**
- Screen1_Exclusions checks EXCLUSIONS list correctly
- Sets classification to EXCLUDED if non-"none" selected
- Navigates to /screen12 (Final Classification) ✅
- Navigates to /screen2 (Role) if no exclusions ✅

**Issues:** ❌
1. **Missing exclusion flag validation**: Current system uses simple array inclusion check. Spec requires explicit flag values: `[military, R&D_only, opensource_free, personal_use, foreign_LE_only]`
2. **Data mismatch**: Need to verify EXCLUSIONS in checklist.js matches spec flags
3. **Navigation target incorrect**: Should go to "SCREEN_FINAL" but current system routes to /screen12. Per spec, excluded systems should skip remaining assessments

**Action Needed:**
- [ ] Verify EXCLUSIONS in checklist.js contains exact flags from spec
- [ ] Update navigation logic to go directly to final checklist or conclusion screen (not classification screen) when excluded
- [ ] Consider if /screen12 (Final Classification) is appropriate end-point for excluded systems

---

### MODULE 2 — RAW ROLE DETERMINATION ❌ CRITICAL MISMATCH

**Spec Requirement:**
- Rule ROLE_001-006: Capture org_actions[] as multiple independent selections
- User can select multiple roles: develop, modify, brand, import, distribute, deploy
- Rule ROLE_007: Error if no roles selected
- Output: roles_raw[] (array of selected actions)

**Current Implementation:**
- Screen1_Role is **radio-button single-selection** (NOT multi-select)
- Uses `role` (singular string) from ENTITY_ROLES: provider, deployer, distributor, importer, product_manufacturer, authorised_representative
- No "action" capture (develop, modify, brand, etc.)
- No error handling for empty selection (handled by disabled button)

**Issues:** ❌ CRITICAL
1. **Wrong input model**: Spec expects org_actions (what user DOES), current asks org roles (what user IS)
2. **Single vs. Multi-select**: Spec expects array of actions; current is single role selection
3. **Missing role reclassification logic**: Module 2B (ROLE_RECLASS_001-013) completely absent
4. **Simplified role options**: Current ENTITY_ROLES doesn't decompose into actions (develop, modify, brand, place_on_market, import, distribute, deploy)

**Action Needed:**
- [ ] Redesign Screen2_Role to capture org_actions as checkboxes (multi-select): develop, modify, brand, place_on_market, import, distribute, deploy
- [ ] Implement Module 2B rule engine (legal role reclassification) in WizardContext
  - [ ] Rule ROLE_RECLASS_001: develop/modify → add Provider
  - [ ] Rule ROLE_RECLASS_002: brand → add Provider
  - [ ] Rule ROLE_RECLASS_003: place_on_market → add Provider
  - [ ] Rules 004-010: Conditional role reassignment based on additional factors
  - [ ] Rule ROLE_RECLASS_011-013: Deduplication and validation
- [ ] Store both roles_raw[] and roles[] (legal roles) in context
- [ ] Update subsequent screens to use roles[] not role

---

### MODULE 3 — ANNEX I A (Product Safety) ❌ INCOMPLETE

**Spec Requirement:**
- Rule A1A_001: If product_laws[] NOT empty → proceed
- Rule A1A_002: If safety_function == yes → classification = "High-risk_Annex_I_A" → SCREEN_8
- Rule A1A_003: If safety_function == no → SCREEN_5

**Current Implementation:**
- Screen5_AnnexIA (Part 3) displays ANNEX_IA_CATEGORIES checkboxes
- Sets classification to HIGH_RISK_IA if any category selected
- **Always navigates to /screen7 (GPAI)** — never to /screen8 (GPAI Systemic)
- **Missing safety_function input** — no yes/no question about safety

**Issues:** ❌
1. **Missing safety function check**: Spec requires secondary question "Is this a safety function?" which determines next screen
2. **Incorrect flow**: Should conditionally jump to Part 8 (GPAI Systemic) if safety_function=yes, but always goes to Part 7
3. **Incomplete rule implementation**: A1A_001 not explicitly checked (implicit via presence)

**Action Needed:**
- [ ] Add secondary question to Screen5_AnnexIA: "Is the AI system part of the safety function of the product?"
- [ ] Implement conditional navigation:
  - [ ] If safety_function == yes → navigate to /screen8 (GPAI Systemic)
  - [ ] If safety_function == no → navigate to /screen7 (GPAI)
- [ ] Store safety_function answer in context
- [ ] Add visual indicator of rule A1A_002 condition check

---

### MODULE 4 — ANNEX I B (Regulated Sectors) ✅ MOSTLY ALIGNED

**Spec Requirement:**
- Rule A1B_001: If regulated_sectors[] NOT empty → classification = "High-risk_Annex_I_B" → SCREEN_8
- Rule A1B_002: If regulated_sectors[] empty → SCREEN_6

**Current Implementation:**
- Screen4_AnnexIB displays HIGH_RISK_SECTORS_B checkboxes
- Sets classification to HIGH_RISK_IB if sectors selected
- Navigates to /screen5 (Annex III) if sectors selected or not
- **Always goes to /screen5** (Annex III Use-Cases)

**Issues:** ❌ NAVIGATION INCORRECT
1. **Wrong next screen**: Spec says if high-risk → SCREEN_8, current always → SCREEN_5
2. **Missing direct jump to CA Route**: If A1B_001 triggers (high-risk Annex I B), system should likely jump closer to classification/CA assessment, not continue Annex III

**Action Needed:**
- [ ] Verify navigation: Should Annex IB high-risk systems skip Annex III entirely?
- [ ] Review spec intent: Rule A1B_001 references SCREEN_8, but current role-based flow numbering differs
- [ ] Potentially restructure flow to skip Annex III for IB high-risk systems

---

### MODULE 5 — ANNEX III USE-CASE + SIGNIFICANT IMPACT ❌ INCOMPLETE

**Spec Requirement:**
- Rule A3_001: If annexIII_usecases[] empty → classification = "In-scope_non-high-risk" → SCREEN_8
- Rule A3_002: If annexIII_usecases[] NOT empty → SCREEN_6b (Significant Risk Check)
- Rule A3_IMPACT_001-003: Multi-option significant impact check with mutual exclusivity

**Current Implementation:**
- Screen7_AnnexIII displays ANNEX_III_USECASES checkboxes
- **Missing Part 6 (Significant Risk Assessment) logic**: Goes directly to /screen6
- Screen7b_SignificantRisk (Part 6) exists but has **conflicting logic**:
  - Implements mutual exclusivity between significantRiskIndicators[] and noRiskIndicators[]
  - Allows selection from two separate sections
  - **Not triggered by Annex III selection alone** — should be gateway

**Issues:** ❌ STRUCTURE BROKEN
1. **Missing conditional check**: Spec Rule A3_001 should auto-classify as non-high-risk if Annex III empty, but current system doesn't
2. **Impact assessment misaligned**: Current Part 6 (Significant Risk Assessment) has different input structure than spec
   - Spec: impact_checks[] with 11 specific criteria
   - Current: significantRiskIndicators[] (12 items) + noRiskIndicators[] (8 items)
3. **Classification logic unclear**: Current Part 6 classification logic doesn't match spec's impact assessment
4. **Flow continuity**: Annex III non-selection should result in "In-scope_non-high-risk" class early (per A3_001), not continue to GPAI

**Action Needed:**
- [ ] Implement Rule A3_001: If annexIIIUsecases[] empty → set classification, skip to /screen9 (Prohibited)
- [ ] Implement Rule A3_002: If annexIIIUsecases[] NOT empty → must go to /screen6 (Significant Risk)
- [ ] Refactor Part 6 (Significant Risk Assessment):
  - [ ] Accept impact_checks[] input matching spec's 11 criteria (not current 20-item approach)
  - [ ] Implement Rule A3_IMPACT_001: If ANY impact criterion selected → HIGH_RISK_III
  - [ ] Implement Rule A3_IMPACT_002: If ONLY "none" selected → AnnexIII_non-significant-risk
  - [ ] Implement Rule A3_IMPACT_003: Mutual exclusivity error (none + other)
- [ ] Update navigation: Part 6 → Part 7 (GPAI) for all paths
- [ ] Fix Part 5 navigation: 
  - [ ] Annex III selected (non-none) → /screen6
  - [ ] Annex III NOT selected (none only) → skip to /screen9 (Prohibited)

---

### MODULE 6 — GPAI SYSTEM / SYSTEMIC RISK ✅ MOSTLY ALIGNED (with caveats)

**Spec Requirement:**
- Rule GPAI_001: If is_gpai == no → SCREEN_9
- Rule GPAI_002: If is_gpai == yes → SCREEN_8b (systemic risk check)
- Rule GPAI_003-004: Based on FLOPS value (≥10^25 = systemic)

**Current Implementation:**
- Screen8_GPAI has is_gpai radio (yes/no)
- Navigates to /screen8 (GPAI Systemic) if yes ✅
- Navigates to /screen9 (Prohibited) if no ✅
- Screen8b_Systemic exists and asks about systemic risk
- **Missing FLOPS input**: No computational capacity assessment

**Issues:** ⚠️ PARTIAL
1. **Missing FLOPS check**: Spec Rules GPAI_003-004 check FLOPS >= 10^25 for systemic risk
2. **Current Part 8 (GPAI Systemic) doesn't capture FLOPS**: Should include input for model computational scale
3. **Auto-classification missing**: Spec says if FLOPS ≥ 10^25 → auto-add "GPAI_systemic_risk" classification

**Action Needed:**
- [ ] Add FLOPS input to Screen8b_Systemic: "Model computational capacity (FLOPS)"
- [ ] Implement Rule GPAI_003: If FLOPS >= 10^25 → add "GPAI_systemic_risk" classification
- [ ] Implement Rule GPAI_004: If FLOPS < 10^25 → add "GPAI" classification (not systemic)
- [ ] Verify Screen8b_Systemic classification logic matches above rules

---

### MODULE 7 — PROHIBITED PRACTICES ✅ ALIGNED

**Spec Requirement:**
- Rule PROHIB_001: If prohibited_actions[] NOT empty → classification = "Prohibited" → SCREEN_FINAL
- Rule PROHIB_002: If prohibited_actions[] empty → SCREEN_10

**Current Implementation:**
- Screen10_Prohibited (Part 9) displays PROHIBITED_PRACTICES checkboxes
- Sets classification to PROHIBITED if selected
- Navigates to /screen12 (Final Classification) if prohibited ✅
- Navigates to /screen10 (Transparency) if not prohibited ✅

**Issues:** ✅ NONE — This module is well-aligned

---

### MODULE 8 — TRANSPARENCY + FRIA ⚠️ INCOMPLETE

**Spec Requirement:**
- Rule TRANS_001: Store transparency_flags[] for later
- Rule FRIA_001: If is_public_body == yes AND classification contains high-risk → add FRIA_required obligation
- Conditional screen routing: If public_authority AND high-risk → SCREEN_10b (FRIA), else SCREEN_11

**Current Implementation:**
- Screen11_Transparency (Part 10) has transparency_triggers checkboxes
- Conditional FRIA routing: If "public sector deployer" AND high-risk → /screen11 (FRIA) ✅
- Screen11b_FRIA (Part 11) exists and captures FRIA requirements

**Issues:** ⚠️
1. **"Public sector deployer" assumption**: Current code checks `role === "deployer"` and assumes public sector. Spec says `is_public_body` should be explicit input
2. **Missing is_public_body input**: Should ask "Is your organization a public body?" as explicit question, not infer from role
3. **transparency_flags storage**: Current system stores but doesn't explicitly "store for later" per spec
4. **FRIA obligation trigger**: Should explicitly trigger FRIA_required obligation in Module 11 (Obligations)

**Action Needed:**
- [ ] Add explicit "Is your organization a public body?" input question (could be on Part 2 Role screen)
- [ ] Update FRIA gating logic: is_public_body == true AND any high-risk classification
- [ ] Ensure transparency_flags[] are properly preserved in context.answers
- [ ] In Module 11 obligation mapping, trigger FRIA obligations conditionally (see below)

---

### MODULE 9 — FINAL CLASSIFICATION SUMMARY ✅ ALIGNED

**Spec Requirement:**
- Rule CLASS_001: Display classification
- Conditional routing: If high-risk → SCREEN_12 (CA Route), else SCREEN_14 (Checklist)

**Current Implementation:**
- Screen12_FinalClassification (Part 12) displays computed classification
- Shows classification label and role
- Navigates to /screen13 (CA Route) for all paths

**Issues:** ⚠️
1. **Missing conditional routing**: Spec says if high-risk → CA Route, else → Checklist. Current system always goes to CA Route
2. **Screen13_ConformityRoute has gating logic** (checks classification), but Module 9 should pre-filter this
3. **Classification summary complete** but routing logic should move to Module 9 context check

**Action Needed:**
- [ ] Implement routing logic in Screen12_FinalClassification:
  - [ ] If classification in [HIGH_RISK_IA, HIGH_RISK_IB, HIGH_RISK_III, GPAI_SYSTEMIC] → navigate to /screen13 (CA Route)
  - [ ] Otherwise → navigate to /screen15 (Checklist)
- [ ] Remove gating logic from Screen13_ConformityRoute (let Module 9 handle it)

---

### MODULE 10 — CONFORMITY ASSESSMENT ROUTING ✅ MOSTLY ALIGNED

**Spec Requirement:**
- Rule CA_001-004: Priority-based route selection (Sectoral > CS > Internal > Notified Body)
- Inputs: Section A-E selections determining route
- Output: CA_route value

**Current Implementation:**
- Screen13A_ConformityRoute (Part 13) has Section A-E checkboxes
- determineRoute() function implements priority logic (Sectoral > CS > Internal > Notified Body) ✅
- Stores conformityRoute in context ✅
- Screen13B_ConformityDetails displays route-specific obligations ✅

**Issues:** ✅ NONE — This module is well-implemented

---

### MODULE 11 — ROLE + CLASSIFICATION → OBLIGATION SETS ❌ INCOMPLETE

**Spec Requirement:**
- Rule OBL_001-011: Trigger obligation sets based on:
  - Role (Provider, Importer, Distributor, Deployer)
  - Classification (GPAI, GPAI_systemic, high-risk, transparency, FRIA, etc.)
  - CA_route (for Conformity Assessment obligations)
- Output: obligations[] array containing A1-A16 (Provider), C1-C15 (Handover), D1-D14 (Importer), E1-E9 (Distributor), F1-F12 (Deployer), G1-G15 (FRIA), H1-H9 (Transparency), I1-I7 (Non-Sig-Risk), J1-J16 (GPAI), K1-K13 (GPAI-Systemic), L1-L9 (Prohibited), M1-M4 (Exclusion), N1-N4 (Product Mfg), O1-O50 (CA routes)

**Current Implementation:**
- Screen13_ObligationCategories maps ROLE × RISK to obligation groups (old screen, not in new 15-screen flow)
- Screen14_Checklist (Part 15) displays applicable checklist items
- **Missing explicit rule engine** for obligation set selection
- **Current logic incomplete**: Doesn't fully capture all obligation combinations from spec

**Issues:** ❌ CRITICAL
1. **No Module 11 rule engine**: Current system doesn't systematically apply Rules OBL_001-011
2. **Obligation data sparse**: checklist.js has CONFORMITY_ASSESSMENT_OBLIGATIONS but missing comprehensive A-O sets
3. **Missing obligation grouping logic**: Should compute obligations[] array that's then displayed in Part 15
4. **No transparency obligation trigger**: Per Rule OBL_008, if transparency_flags NOT empty → add Transparency obligations (H1-H9)
5. **No FRIA obligation trigger**: Per Rule OBL_009, if FRIA_required → add FRIA obligations (G1-G15)
6. **No non-significant risk notification**: Per Rule OBL_010, if classification == AnnexIII_non-significant-risk → add I1-I7

**Action Needed:**
- [ ] Expand checklist.js with complete obligation definitions:
  - [ ] Provider (A1-A16) — comprehensive list with items
  - [ ] Handover (C1-C15) — documentation handover items
  - [ ] Importer (D1-D14) — importer-specific items
  - [ ] Distributor (E1-E9) — distributor-specific items
  - [ ] Deployer (F1-F12) — deployer-specific items
  - [ ] FRIA (G1-G15) — FRIA assessment items
  - [ ] Transparency (H1-H9) — transparency items
  - [ ] Non-Sig-Risk (I1-I7) — notification items
  - [ ] GPAI (J1-J16) — GPAI-specific items
  - [ ] GPAI-Systemic (K1-K13) — systemic risk items
  - [ ] Prohibited (L1-L9) — cease operations items
  - [ ] Exclusion (M1-M4) — no obligations
  - [ ] Product Mfg (N1-N4) — manufacturer items
- [ ] Implement obligation calculation function in WizardContext (Module 11 rule engine):
  - [ ] Input: roles[], classification, CA_route, transparency_flags[], is_public_body, is_fria
  - [ ] Apply Rules OBL_001-011 logic
  - [ ] Output: obligations[] array of applicable obligation category codes
- [ ] Update Screen14_Checklist to render obligations[] with complete item lists
- [ ] Ensure obligation sets are displayed with Article citations from spec

---

### MODULE 12 — OUTPUT CHECKLIST ⚠️ PARTIAL

**Spec Requirement:**
- Rule OUTPUT_001: Render all_obligations with full details
- Display with organization, articles, and action items

**Current Implementation:**
- Screen14_Checklist (Part 15) renders applicable items
- Shows role + classification context
- **Missing comprehensive obligation display**
- **No article citations or external references**

**Issues:** ⚠️
1. **Output completeness**: Should show A1-O50 obligation definitions from spec, current shows partial list
2. **Article citations missing**: Spec includes Article references, current doesn't display them
3. **Obligation grouping**: Should organize by category (A, C, D, E, F, G, H, I, J, K, L, M, N, O)
4. **Export/print functionality**: Spec implies structured output, current may not support it

**Action Needed:**
- [ ] Add comprehensive obligation definitions to display with article citations
- [ ] Organize output by obligation category (A-O)
- [ ] Add Article reference display
- [ ] Consider PDF export or structured output format

---

## WORKFLOW FLOW ANALYSIS

### Current 15-Screen Flow:
```
1. Exclusions → 2. Roles → 3. AnnexIA → 4. AnnexIB → 5. AnnexIII 
→ 6. SigRisk → 7. GPAI → 8. GPAI-Systemic → 9. Prohibited 
→ 10. Transparency → 11. FRIA (gated) → 12. Classification 
→ 13. CA-Route (gated) → 14. CA-Details (gated) → 15. Checklist
```

### Spec Requirement with Modules:
```
Exclusions (EXCL) → Role Determination (ROLE) → Role Reclassification (ROLE_B)
→ Annex IA (A1A) → Annex IB (A1B) → Annex III (A3) 
→ GPAI (GPAI) → Prohibited (PROHIB) → Transparency (TRANS) 
→ FRIA (FRIA, conditional) → Classification (CLASS) 
→ CA Routing (CA) → Obligation Mapping (OBL) → Output (OUTPUT)
```

### Flow Discrepancies:

| Screen | Current | Spec | Status |
|--------|---------|------|--------|
| 1. Exclusions | Present, routes to Role or Classification | EXCL_001-002 | ✅ Aligned |
| 2. Roles | Single-select radio, no reclassification | ROLE_001-007, ROLE_RECLASS_001-013 | ❌ Critical |
| 3. AnnexIA | Direct to GPAI, missing safety_function | A1A_001-003 | ❌ Missing branch |
| 4. AnnexIB | Always to AnnexIII | A1B_001-002 | ⚠️ Navigation unclear |
| 5. AnnexIII | Conditional to SigRisk or GPAI | A3_001-003 | ⚠️ Incomplete |
| 6. SigRisk | Has different input structure | A3_IMPACT_001-003 | ❌ Misaligned |
| 7. GPAI | Present, missing FLOPS | GPAI_001-002 | ⚠️ Missing FLOPS |
| 8. GPAI-Systemic | Present, no FLOPS logic | GPAI_003-004 | ⚠️ Missing rule |
| 9. Prohibited | Present, correct routing | PROHIB_001-002 | ✅ Aligned |
| 10. Transparency | Present, missing is_public_body input | TRANS_001, FRIA_001 | ⚠️ Implicit public body |
| 11. FRIA | Present (gated), logic mostly correct | FRIA_001 | ✅ Mostly aligned |
| 12. Classification | Present, missing conditional next | CLASS_001 | ⚠️ Missing condition |
| 13. CA-Route | Present, gating works | CA_001-004 | ✅ Aligned |
| 14. CA-Details | Present | (Part of CA module) | ✅ Aligned |
| 15. Checklist | Present, output incomplete | OBL_001-011, OUTPUT_001 | ❌ Incomplete |

---

## DATA STRUCTURE ALIGNMENT

### checklist.js Data vs. Spec

| Data Item | Current | Spec | Gap |
|-----------|---------|------|-----|
| ENTITY_ROLES | 6 roles | org_actions (7 types) | ❌ Different model |
| EXCLUSIONS | Array present | [military, R&D, opensource, personal, foreign_LE] | ⚠️ Verify exact match |
| ANNEX_IA_CATEGORIES | Present (6 items) | Product safety frameworks | ⚠️ Verify mapping |
| ANNEX_III_USECASES | Present (list) | Spec not detailed | ✅ Seems aligned |
| CLASSIFICATIONS | 10 types defined | 10+ types in spec | ⚠️ Verify enum |
| CONFORMITY_ASSESSMENT_OBLIGATIONS | Partial | O1-O50 per route | ❌ Incomplete |
| ALL_OBLIGATIONS | Sparse | A1-O50 comprehensive | ❌ Missing |

---

## CONTEXT/STATE MANAGEMENT ISSUES

### WizardContext Alignment

| State Variable | Current | Spec Required | Gap |
|---|---|---|---|
| role | Single string | Not used; roles[] array needed | ❌ |
| roles_raw | Missing | org_actions array | ❌ |
| roles | Missing | Legal roles after reclassification | ❌ |
| answers.modifications | Present | Not in ROLE module (Module 2B removed) | ⚠️ |
| answers.annexIACategories | Present | Matches A1A | ✅ |
| answers.annexIIIUsecases | Present | Matches A3 | ✅ |
| answers.isGPAI | Present | Matches GPAI_001 | ✅ |
| answers.flopsValue | Missing | GPAI_003-004 require this | ❌ |
| answers.prohibitedPractices | Present | Matches PROHIB | ✅ |
| answers.transparencyTriggers | Present | Matches TRANS_001 | ✅ |
| answers.conformity_section_a-e | Present | Matches CA_001-004 | ✅ |
| answers.is_public_body | Missing | FRIA_001 requires this | ❌ |
| answers.safety_function | Missing | A1A_002 requires this | ❌ |
| classification | Present | Matches spec | ✅ |
| conformityRoute | Present | Matches CA module | ✅ |
| obligations | Missing | Required by Module 11 | ❌ |

---

## SUMMARY TABLE: REQUIRED MODIFICATIONS

### CRITICAL (Blocks full compliance)
1. **Screen2_Role (Part 2)**: Redesign to capture org_actions[], implement Module 2B reclassification
2. **Role state management**: Migrate from `role` (string) to `roles[]` (array) and `roles_raw[]` (array)
3. **Module 11 engine**: Implement OBL_001-011 rule logic in WizardContext
4. **Obligation data**: Expand checklist.js with A1-O50 complete definitions
5. **Screen15_Checklist**: Update to render computed obligations[] with full details

### HIGH PRIORITY (Significant functional gaps)
6. **Screen3_AnnexIA**: Add safety_function question, conditional routing to Part 8
7. **Module A3 gating**: Implement Rule A3_001 (skip Part 9 if no Annex III)
8. **Part 6 (SigRisk)**: Refactor inputs to match spec's impact_checks[]
9. **Part 9 (Prohibition)**: Add gating check (skip to Classification if empty, currently goes to Transparency)
10. **is_public_body input**: Add explicit question (Part 2 or Part 10)
11. **Part 8b (GPAI-Systemic)**: Add FLOPS input, implement Rules GPAI_003-004

### MEDIUM PRIORITY (Refinements)
12. **Module 9 routing**: Implement conditional next screen (high-risk → CA Route, else → Checklist)
13. **Part 12 navigation**: Remove CA Route forcing, implement CLASS_001 conditional
14. **Data verification**: Confirm EXCLUSIONS, ANNEX_IA_CATEGORIES, CLASSIFICATIONS match spec exactly
15. **Article citations**: Add Article references to obligation display
16. **Transparency obligation trigger**: Rule OBL_008 (transparency_flags[] → H1-H9)
17. **FRIA obligation trigger**: Rule OBL_009 (FRIA_required → G1-G15)
18. **Non-sig-risk obligation**: Rule OBL_010 (AnnexIII_non-significant → I1-I7)

### LOW PRIORITY (Enhancement)
19. **FLOPS classification**: Implement GPAI_003 vs GPAI_004 branching
20. **Export/print functionality**: Structured output with article citations
21. **Advanced role reclassification**: Rules ROLE_RECLASS_004-010 (conditional role reassignment)

---

## RECOMMENDED IMPLEMENTATION ORDER

**Phase 1 (Critical Foundation):**
1. Redesign Part 2 Role screen (org_actions multi-select + Module 2B reclassification logic)
2. Implement Module 11 obligation engine in WizardContext
3. Expand checklist.js with A1-O50 obligation definitions
4. Update Part 15 Checklist to render obligations[]
5. Add is_public_body and safety_function inputs

**Phase 2 (Flow Completion):**
6. Implement Module A3 gating (Rule A3_001)
7. Refactor Part 6 (Significant Risk) inputs and logic
8. Add FLOPS input and rules (GPAI_003-004)
9. Implement Module 9 conditional routing (CLASS_001)
10. Fix Part 4/5 navigation flow

**Phase 3 (Polish & Refinement):**
11. Add article citations throughout
12. Implement conditional obligation triggers (OBL_008-010)
13. Enhance output formatting
14. Add export/print functionality

---

## CONFIGURATION & VALIDATION CHECKLIST

- [ ] EXCLUSIONS flags match spec exactly: military, R&D_only, opensource_free, personal_use, foreign_LE_only
- [ ] CLASSIFICATIONS enum complete: OUT_OF_SCOPE, EXCLUDED, PROHIBITED, GPAI, GPAI_SYSTEMIC, HIGH_RISK_IA, HIGH_RISK_IB, HIGH_RISK_III, ANNEX_III_NON_SIGNIFICANT, IN_SCOPE_NON_HIGH_RISK
- [ ] ANNEX_IA_CATEGORIES map to product safety frameworks correctly
- [ ] ANNEX_III_USECASES represent high-risk use cases
- [ ] CONFORMITY_ASSESSMENT_ROUTES: Sectoral_Law, Common_Specifications, Internal_Control, Notified_Body
- [ ] HIGH_RISK_SECTORS_B match Annex I Section B sectors
- [ ] PROHIBITED_PRACTICES match Article 5 prohibited practices
- [ ] TRANSPARENCY_TRIGGERS capture Article 52 transparency situations

---

## NOTES FOR IMPLEMENTATION TEAM

1. **Backward Compatibility**: Current answers with `role` (string) will break when migrated to `roles[]` (array). Migration plan needed.
2. **Legal Complexity**: Module 2B reclassification rules are complex; consider adding detailed comments with Article citations.
3. **Obligation Data**: Use spec's obligation section as source of truth for A1-O50 definitions. Include Article citations.
4. **Testing**: Each module should be unit-tested against spec rules (e.g., ROLE_RECLASS_001, CA_001, OBL_008, etc.)
5. **Documentation**: Add rule IDs (EXCL_001, ROLE_002, etc.) as comments in code for traceability.

---

**End of Analysis Document**
