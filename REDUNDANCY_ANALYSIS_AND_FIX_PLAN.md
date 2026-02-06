# Redundancy Analysis & Fix Plan (NO EDITS YET)

## EXECUTIVE SUMMARY
Analysis identifies **2 main redundancies** and **3 critical architectural issues**. All issues to be fixed in single coordinated implementation.

---

## SECTION 1: REDUNDANCIES IDENTIFIED

### REDUNDANCY #1: Dual Role Systems (roles vs role)
**Location**: WizardContext.jsx lines 5-10

**Problem**:
```javascript
const [roles_raw, setRoles_raw] = useState([]); // Module 2: Raw org_actions
const [roles, setRoles] = useState([]); // Module 2B: Legal roles (USED)
const [role, setRole] = useState(null); // DEPRECATED - Legacy single role
```

**Analysis**:
- `roles` array is used throughout (WizardContext, Screen12, Screen13)
- `role` (singular) is NEVER used in current implementation
- Comment explicitly says "deprecated, will be removed"
- Screen2_Modification.jsx has `setRole("provider")` but this value is never consumed

**Impact**: Confusion, dead code, unnecessary state updates

**Fix**: 
- Remove `role` and `setRole` from WizardContext (lines 7)
- Remove from context exports (lines 480-510 area)
- Remove `setRole` call from Screen2_Modification.jsx
- No logic changes needed

---

### REDUNDANCY #2: Duplicate Public Authority Detection Logic
**Location**: WizardContext.jsx (computeObligations) vs Screen11b_FRIA.jsx

**Problem**:
```javascript
// WizardContext.jsx line 217
const isPublicBody = answers.is_public_body === true;

// Screen11b_FRIA.jsx line 15
const isPublicBody = answers.is_public_body;

// WizardContext.jsx line 223
const requiresFRIA = (isPublicBody || hasSensitiveDeploymentSector) && isHighRisk;

// Screen11b_FRIA.jsx line 24
const friaRequired = isPublicBody === true && isHighRisk;
```

**Analysis**:
- Both screens independently re-derive FRIA requirement from same inputs
- Screen11b logic is LESS complete (doesn't check deploymentSectors expansion)
- WizardContext logic is AUTHORITATIVE but not used on screen
- Screen11b shows FRIA status to user but that status is also computed in WizardContext

**Impact**: 
- User-facing FRIA determination on Screen11b doesn't account for sensitive deployment sectors
- Obligation computation and screen display can diverge
- Duplicated logic = maintenance risk

**Fix**:
- Keep FRIA determination ONLY in WizardContext.computeObligations()
- Pass computed `isFria` state to Screen11b for display (already has `setIsFria`)
- Remove duplicate logic from Screen11b
- Screen11b becomes pure UI/collection screen, not logic screen

---

## SECTION 2: ARCHITECTURAL ISSUES

### ISSUE #1: Missing Public_Authority Role
**Rule Engine Requirement**: TRANS_001 and FRIA_001 check `roles contains 'Public_Authority'`

**Current State**: 
- `is_public_body` is collected as boolean in Screen11b_FRIA (too late)
- Not added to `roles[]` array
- computeObligations checks `is_public_body` directly, NOT roles array

**Problem Chain**:
1. User selects role activities in Screen1 (Provider, Deployer, etc.)
2. `roles` array is computed and finalized in Screen1's handleNext() 
3. Later in Screen11b, user answers "Are you a public body?" 
4. This should ADD "Public_Authority" to roles, but it doesn't
5. Rule Engine expects Public_Authority in roles[], not separate boolean

**Architecture Gap**: 
- Roles should be finalized by Screen1, not extended in Screen11b
- But public authority status isn't known until Screen11b
- Current system uses `is_public_body` workaround instead of proper role

**Fix Strategy**: 
- Option A (Recommended): Map `is_public_body=true` to virtual "Public_Authority" in roles check
  - Least disruption to flow
  - Make computeObligations check: `roles.includes("Public_Authority") OR answers.is_public_body === true`
  - Add comment explaining Rule Engine expects Public_Authority role but we collect later as boolean
  
- Option B (Pure but disruptive): Add Public_Authority question to Screen1/Screen2
  - Would require screen restructuring
  - More aligned with Rule Engine v02
  - Higher risk of breaking flow

**Recommendation**: Implement Option A

---

### ISSUE #2: Missing SCREEN_10b for Public Authority FRIA
**Rule Engine Requirement**: TRANS_001 conditional routing
```
IF: roles contains 'Public_Authority' AND high-risk
THEN: SCREEN_10b
ELSE: SCREEN_11
```

**Current State**:
- No SCREEN_10b screen exists
- Navigation always goes to SCREEN_11 (Transparency)
- SCREEN_11 doesn't have early-exit for non-public-authority cases

**Problem**: 
- Public authorities with high-risk systems should get dedicated FRIA screen first
- Currently they answer "Are you public body?" on Screen11b AFTER answering transparency triggers on Screen11
- Violates Rule Engine sequencing

**Current Flow**:
```
Screen9 (Prohibited) 
  → Screen10 (Transparency) 
  → Screen11b (FRIA/Public body) 
  → Screen12 (Classification)
```

**Required Flow**:
```
Screen9 (Prohibited)
  → IF public_authority AND high-risk → Screen10b (FRIA primary)
  → ELSE Screen11 (Transparency)
  → Screen11b (FRIA secondary / deployment sectors)
  → Screen12 (Classification)
```

**Architecture Challenge**: 
- Can't know if public_authority until Screen11b is answered
- But Screen10b routing decision must happen BEFORE Screen11
- Classic catch-22: need info to route, but info comes from later screen

**Fix Strategy**:
- Conditionally SKIP Screen11 (Transparency) for public authorities
- Route: Screen9 → Screen10b (FRIA) → Screen12 (Classification)
- But need to conditionally show Screen11 for private sector → Screen11b
- Requires dynamic routing based on `answers.is_public_body`

**Recommended Implementation**:
1. Screen11b_FRIA becomes gateway deciding public/private → routes to Screen11 or Screen12
2. Screen11 (Transparency) is optional, only shown if NOT public body
3. Screen10b becomes "FRIA Detailed" for public bodies (after transparency decision)
4. Create conditional routing logic in Screen11b.handleNext()

OR simpler approach:
1. Keep current Screen10 → Screen11 flow for transparency
2. Screen11b remains FRIA gate but adds conditional routing:
   - If public_authority AND high-risk → Show "FRIA Required" prominence
   - Screen becomes Screen10b effectively by gating behavior

---

### ISSUE #3: Missing CLASS_001 Conditional Routing
**Rule Engine Requirement**: MODULE 9 - CLASS_001
```
IF: high-risk classification
THEN: SCREEN_12 (CA Route)
ELSE: SCREEN_14 (Checklist)
```

**Current State**:
- Screen12_FinalClassification ALWAYS routes to `/screen13` (CA Route) on handleNext()
- No conditional check for classification level
- Screen13_ConformityRoute has its own gating (lines 80-100 area) checking high-risk

**Current Flow**:
```
Screen12 (Classification display)
  → Screen13A (CA Route determination)
  → Screen13 (CA Route details)  [or skips if not provider]
  → Screen14 (Checklist)
```

**Required Flow** (per CLASS_001):
```
Screen12 (Classification display)
  → IF high-risk → Screen13A (CA Route determination)
  → IF not high-risk → Screen14 (Checklist)
```

**Problem**: 
- Non-high-risk systems shown CA Route screen unnecessarily
- CA Route screen shows "No CA route needed" for non-high-risk
- Extra clicks for 95% of systems that aren't high-risk

**Fix**:
- In Screen12_FinalClassification.handleNext(), add conditional:
  ```javascript
  if (["high_risk_ia", "high_risk_ib", "high_risk_iii"].includes(finalClassification)) {
    navigate("/screen13");  // CA Route
  } else {
    navigate("/screen14");  // Checklist directly
  }
  ```

---

## SECTION 3: NON-REDUNDANCY ITEMS (ALREADY CORRECT)

### ✅ DEPLOYMENT_SECTORS "other" option
- **Status**: READY TO REMOVE
- **Location**: src/data/checklist.js line 109
- **Reason**: User explicitly requested removal (duplicates "None of the above")
- **Current array**: 5 items including "other"
- **After fix**: 4 items without "other"
- **No logic changes needed**: only used in Screen11b_FRIA for sensitive sector check

### ✅ OBL_008, OBL_017 Filtering
- Already correctly implemented
- No redundancy

### ✅ PROHIB_001 Route to /screenFinal
- Already correctly implemented
- No redundancy

---

## SECTION 4: FIX IMPLEMENTATION PLAN

### STEP 1: Remove Deprecated `role` State (No Logic Impact)
**Files**: 
- src/state/WizardContext.jsx (remove state var, remove export)
- src/screens/Screen2_Modification.jsx (remove setRole call)

**Risk**: Low - dead code removal

---

### STEP 2: Fix DEPLOYMENT_SECTORS (No Logic Impact)
**Files**: 
- src/data/checklist.js

**Changes**:
- Remove "other" object from DEPLOYMENT_SECTORS array
- Keep "none" object

**Risk**: Low - simple array modification

---

### STEP 3: Map is_public_body to Public_Authority Check (Core Fix #1)
**Files**:
- src/state/WizardContext.jsx computeObligations() function

**Changes**:
- Update TRANS_001 logic to check: `roles.includes("Public_Authority") OR answers.is_public_body === true`
- Update FRIA_001 logic similarly
- Add explanatory comment

**Logic**: 
```javascript
// Before
if (roles.includes("Provider") || roles.includes("Deployer")) { ... }

// After (OBL_008)
const isPublicAuthority = roles.includes("Public_Authority") || answers.is_public_body === true;
if (hasTransparencyTriggers && isProviderOrDeployer) {
  obs.push("H");
}

// Similar for OBL_009 (FRIA)
const isPublicAuthority = roles.includes("Public_Authority") || answers.is_public_body === true;
const requiresFRIA = (isPublicAuthority || hasSensitiveDeploymentSector) && isHighRisk;
if (requiresFRIA) {
  obs.push("G");
}
```

**Risk**: Medium - affects obligation computation core logic

---

### STEP 4: Deduplicate FRIA Logic in Screen11b (Redundancy #2 Fix)
**Files**:
- src/screens/Screen11b_FRIA.jsx

**Changes**:
- Remove duplicate `requiresFRIA` calculation
- Use state passed from WizardContext: pass `isFria` and `obligations` to screen
- Change Screen11b to pure UI/collection screen

**Logic**:
```javascript
// Before: Screen11b independently calculates FRIA
const friaRequired = isPublicBody === true && isHighRisk;

// After: Read from context obligations
const friaRequired = obligations.includes("G");
```

**Note**: Already have `useWizard()` hook importing isFria, so can use directly

**Risk**: Medium - but improves data consistency

---

### STEP 5: Add CLASS_001 Conditional Routing (Core Fix #3)
**Files**:
- src/screens/Screen12_FinalClassification.jsx

**Changes**:
- Modify handleNext() to check classification level
- Route to /screen13 for high-risk, /screen14 for non-high-risk

**Logic**:
```javascript
const handleNext = () => {
  if (shouldReevaluateRules) {
    setShouldReevaluateRules(false);
  }
  
  // CLASS_001: Route based on risk level
  const isHighRisk = [
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(finalClassification);
  
  if (isHighRisk) {
    navigate("/screen13");  // CA Route required
  } else {
    navigate("/screen14");  // Skip to checklist
  }
};
```

**Risk**: Low - improves UX, fixes Rule Engine alignment

---

### STEP 6: Implement Dynamic SCREEN_10b Routing (Core Fix #2)
**Files**:
- src/screens/Screen11_Transparency.jsx (update routing)
- src/state/WizardContext.jsx (add dynamic routing logic)

**Option A - Simple (Recommended)**:
- Keep Screen11_Transparency as is
- Change Screen11b_FRIA routing decision:
  - Check `is_public_body` AND `isHighRisk`
  - If TRUE: show "FRIA Primary" content, route to Screen12
  - If FALSE (non-public): route back to Screen11 (Transparency)
- Effectively makes Screen11b act as SCREEN_10b gateway

**Option B - Full Redesign**:
- Create new Screen10b_FRIA dedicated screen
- Update routing in App.jsx
- Screen flow: 9 → check public_body early → 10b or 11 → 12

**Recommendation**: Implement Option A initially (lower risk)
- If public_authority AND high-risk: "FRIA Required - Full Assessment Needed"
- If public_authority AND not high-risk: "Public Authority Selected, but FRIA not required"
- Screen11b already handles this, just needs better routing

---

## SECTION 5: EXECUTION CHECKLIST

### Phase 1: Low-Risk Removals (No Logic Impact)
- [ ] Remove deprecated `role` state from WizardContext
- [ ] Remove `setRole` export from WizardContext  
- [ ] Remove `setRole("provider")` call from Screen2_Modification.jsx
- [ ] Remove "other" from DEPLOYMENT_SECTORS array in checklist.js

### Phase 2: Core Logic Fixes (Medium Risk)
- [ ] Map is_public_body to Public_Authority check in computeObligations
- [ ] Add CLASS_001 conditional routing in Screen12
- [ ] Deduplicate FRIA logic in Screen11b

### Phase 3: Navigation Optimization (Medium Risk)
- [ ] Review Screen11b routing based on public_authority + high-risk
- [ ] Consider Screen10b gating if needed after Phase 2 testing

### Phase 4: Validation
- [ ] Build and test all changes
- [ ] Verify no compilation errors
- [ ] Test navigation flows
- [ ] Commit and push

---

## SECTION 6: RISK MITIGATION

**Redundancy Risk**: Low
- Removing dead code `role` is pure cleanup
- Removing "other" is user request, no logic dependency

**Logic Risk**: Medium
- is_public_body mapping to Public_Authority check is straightforward
- FRIA deduplication is safe (reading computed value instead of re-computing)
- CLASS_001 routing is standard conditional

**Navigation Risk**: Medium
- Screen flow changes must be tested
- Backward navigation must be validated

**Mitigation Strategy**:
1. Implement Phase 1 first (validate no breakage)
2. Implement Phase 2 core fixes independently, test each
3. Test complete flow with sample scenarios
4. Commit regularly with descriptive messages

---

## SECTION 7: KEY DECISION POINTS

### Decision 1: Public_Authority Implementation
**Question**: Implement option A (OR check with is_public_body) or Option B (add to Screen1)?

**Recommendation**: Option A
- Reason: Screen1 doesn't know organizational structure yet, public authority status is determined in Screen11b
- Adding to Screen1 requires restructuring early screens
- OR check is pragmatic: "Public_Authority in roles OR is_public_body boolean"
- Add comment explaining why

---

### Decision 2: SCREEN_10b Implementation
**Question**: Create dedicated Screen10b or modify Screen11b behavior?

**Recommendation**: Modify Screen11b for now (Option A)
- Reason: Simpler, less refactoring
- Screen11b already does the determination, just needs better messaging and routing
- Can always refactor to dedicated Screen10b later if needed

---

### Decision 3: Test Coverage
**Question**: What scenarios to test after fixes?

**Recommendation**:
1. Non-public-body, non-high-risk → Should skip CA Route (Screen14 direct)
2. Public-body, high-risk → Should see FRIA determination
3. Public-body, non-high-risk → Should skip CA Route
4. Non-public Provider, high-risk → Should see CA Route (Screen13)
5. Navigation back/forward should preserve state

---

## FINAL SUMMARY

| Item | Type | Risk | Status |
|------|------|------|--------|
| Remove `role` state | Redundancy | Low | Ready |
| Remove DEPLOYMENT_SECTORS "other" | Cleanup | Low | Ready |
| Map is_public_body to Public_Authority | Fix #1 | Medium | Ready |
| CLASS_001 conditional routing | Fix #3 | Low | Ready |
| Deduplicate FRIA logic | Redundancy | Medium | Ready |
| SCREEN_10b routing | Fix #2 | Medium | Ready (Phase 3) |

**Total Changes**: ~6 files, ~30 lines modified, NO NEW SCREENS required initially

**Estimated Impact**: Eliminates all critical Rule Engine inconsistencies + removes dead code

