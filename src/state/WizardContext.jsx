import { createContext, useContext, useState, useEffect } from "react";
import { CLASSIFICATIONS } from "../data/checklist";

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  // Core wizard state
  const [roles_raw, setRoles_raw] = useState([]); // Module 2: Raw org_actions (user input)
  const [roles, setRoles] = useState([]); // Module 2B: Legal roles after reclassification
  const [answers, setAnswers] = useState({});
  const [classification, setClassification] = useState(null);
  const [obligations, setObligations] = useState([]);
  const [conformityRoute, setConformityRoute] = useState(null);
  const [isFria, setIsFria] = useState(false);
  const [completedItems, setCompletedItems] = useState({});
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [shouldReevaluateRules, setShouldReevaluateRules] = useState(false); // Flag to force re-evaluation after Back navigation
  const [isNavigatingBack, setIsNavigatingBack] = useState(false); // Flag to prevent history push during back navigation
  // Track modifications
  const hasModifications = answers.modifications && 
    answers.modifications.some(m => m !== "none");

  // Track high-risk selections
  const hasHighRiskB = answers.highRiskSectorsB && 
    answers.highRiskSectorsB.length > 0 && 
    !answers.highRiskSectorsB.includes("none");

  const hasAnnexIA = answers.annexIACategories && 
    answers.annexIACategories.length > 0 && 
    !answers.annexIACategories.includes("none");

  const hasAnnexIII = answers.annexIIIUsecases && 
    answers.annexIIIUsecases.length > 0 && 
    !answers.annexIIIUsecases.includes("none");

  // Track exclusions and prohibited
  const hasExclusions = answers.exclusions && 
    answers.exclusions.some(e => e !== "none");

  const hasProhibited = answers.prohibitedPractices && 
    answers.prohibitedPractices.some(p => p !== "none");

  // ========== MODULE 2B: LEGAL ROLE RECLASSIFICATION ==========
  // Converts org_actions (raw) → legal roles per EU AI Act
  // Rules ROLE_RECLASS_001-014 per Specification
  const reclassifyRoles = (raw_actions) => {
    const legal_roles = new Set();
    let provider_assigned = false;

    // RULE RECLASS_FLAG_INIT: Initialize tracking
    // (provider_assigned = false is initialized above)

    // ========== BLOCK 1 - DEVELOPMENT/MODIFICATION → PROVIDER ==========
    // RULE RECLASS_001: develop/modify/retrain/fine_tune/change_purpose → Provider (Art. 3, 16)
    if (raw_actions.includes("develop") || raw_actions.includes("modify") || raw_actions.includes("retrain") || raw_actions.includes("fine_tune") || raw_actions.includes("change_purpose")) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // ========== BLOCK 2 - BRANDING → PROVIDER ==========
    // RULE RECLASS_002: brand → Provider (Art. 3)
    if (raw_actions.includes("brand")) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // ========== BLOCK 3 - MARKET PLACER → PROVIDER ==========
    // RULE RECLASS_003: place_on_market → Provider (Art. 16)
    if (raw_actions.includes("place_on_market")) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // ========== BLOCK 4 - PRODUCT MANUFACTURER (SAFETY COMPONENT) → PROVIDER ==========
    // RULE RECLASS_004: product_manufacturer + ai_is_safety_component → Provider (Art. 24)
    // Note: ai_is_safety_component would come from answers object if needed
    // For now, if product_manufacturer is selected, we treat as potential Provider
    if (raw_actions.includes("product_manufacturer")) {
      // Check if there's a safety_function flag in answers
      if (answers.safety_function === "yes") {
        legal_roles.add("Provider");
        provider_assigned = true;
      }
    }

    // ========== BLOCK 5 - IMPORTER WHO REBRANDS OR MODIFIES → PROVIDER ==========
    // RULE RECLASS_005: (importer) + (brand OR modify/retrain/fine_tune/change_purpose) → Provider (Art. 25)
    if (raw_actions.includes("import") && (raw_actions.includes("brand") || raw_actions.includes("modify") || raw_actions.includes("retrain") || raw_actions.includes("fine_tune") || raw_actions.includes("change_purpose"))) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // ========== BLOCK 6 - DISTRIBUTOR WHO REBRANDS OR MODIFIES → PROVIDER ==========
    // RULE RECLASS_006: (distributor) + (brand OR modify/retrain/fine_tune/change_purpose) → Provider (Art. 26)
    if (raw_actions.includes("distribute") && (raw_actions.includes("brand") || raw_actions.includes("modify") || raw_actions.includes("retrain") || raw_actions.includes("fine_tune") || raw_actions.includes("change_purpose"))) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // ========== BLOCK 7 - DEPLOYER WHO MODIFIES → PROVIDER ==========
    // RULE RECLASS_007: (deployer) + (modifications: develop/modify/retrain/fine_tune) → Provider (Art. 16(2))
    if (raw_actions.includes("deploy") && (raw_actions.includes("modify") || raw_actions.includes("develop") || raw_actions.includes("retrain") || raw_actions.includes("fine_tune"))) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // ========== BLOCK 8 - NON-MODIFYING DEPLOYER → DEPLOYER ==========
    // RULE RECLASS_008: deployer without modifications → Deployer (Art. 29)
    if (raw_actions.includes("deploy") && !provider_assigned) {
      legal_roles.add("Deployer");
    }

    // ========== BLOCK 9 - IMPORTER (UNBRANDED) → IMPORTER ==========
    // RULE RECLASS_009: (importer) without brand AND not provider → Importer (Art. 25)
    if (raw_actions.includes("import") && !provider_assigned) {
      legal_roles.add("Importer");
    }

    // ========== BLOCK 10 - DISTRIBUTOR (UNBRANDED) → DISTRIBUTOR ==========
    // RULE RECLASS_010: (distributor) without brand AND not provider → Distributor (Art. 26)
    if (raw_actions.includes("distribute") && !provider_assigned) {
      legal_roles.add("Distributor");
    }

    // ========== BLOCK 11 - PRODUCT MANUFACTURER (NOT SAFETY COMPONENT) ==========
    // RULE RECLASS_011: product_manufacturer + NOT ai_is_safety_component → Product_Manufacturer
    if (raw_actions.includes("product_manufacturer") && !provider_assigned) {
      // Only add Product_Manufacturer if it wasn't converted to Provider in Block 4
      if (answers.safety_function !== "yes") {
        legal_roles.add("Product_Manufacturer");
      }
    }

    // ========== BLOCK 12 - FINAL CONSOLIDATION ==========
    // RULE RECLASS_012: Deduplicate roles
    const deduplicated = Array.from(legal_roles);

    // ========== BLOCK 13 - ERROR IF EMPTY ==========
    // RULE RECLASS_013: Error if no roles determined
    if (deduplicated.length === 0) {
      console.warn("ROLE_RECLASS_013: No legal roles determined from org_actions", { raw_actions });
      return [];
    }

    // ========== BLOCK 14 - DISPLAY/RETURN COMPUTED ROLES ==========
    // RULE RECLASS_014: Return and display computed roles
    console.log("ROLE_RECLASS_014: Computed legal roles:", deduplicated);
    return deduplicated;
  };

  // Automatically persist computed obligations whenever inputs change
  useEffect(() => {
    try {
      const obs = computeObligations();
      setObligations(obs);
    } catch (e) {
      console.warn("Error computing obligations:", e);
    }
  // Recompute when legal roles, classification, conformityRoute, or relevant answers change
  }, [roles, classification, conformityRoute, answers.transparencyTriggers, answers.is_public_body, answers.flopsValue, answers.annexIIIUsecases, answers.prohibitedPractices]);

  // ========== MODULE 11: OBLIGATION ENGINE ==========
  // Computes applicable obligations per Rules OBL_001-011
  const computeObligations = () => {
    const obs = [];

    // OBL_001: Provider obligations (A1-A16)
    if (roles.includes("Provider")) {
      obs.push("A");
    }

    // OBL_017: Handover (C1-C15) only if Provider AND high-risk classification
    if (roles.includes("Provider") && classification && ["high_risk_ia", "high_risk_ib", "high_risk_iii"].includes(classification)) {
      obs.push("C");
    }

    // OBL_002: Importer obligations (D1-D14)
    if (roles.includes("Importer")) {
      obs.push("D");
    }

    // OBL_003: Distributor obligations (E1-E9)
    if (roles.includes("Distributor")) {
      obs.push("E");
    }

    // OBL_004: Deployer obligations (F1-F12)
    if (roles.includes("Deployer")) {
      obs.push("F");
    }

    // OBL_005: GPAI obligations (J1-J16)
    if (classification === "gpai") {
      obs.push("J");
    }

    // OBL_006: GPAI Systemic obligations (K1-K13)
    if (classification === "gpai_systemic") {
      obs.push("K");
    }

    // OBL_007: Conformity Assessment obligations (O1-O50 by route)
    if (classification && ["high_risk_ia", "high_risk_ib", "high_risk_iii"].includes(classification)) {
      obs.push("O");
      // Note: O obligations filtered by route in screen rendering
    }

    // OBL_008: Transparency obligations (H1-H9) if transparency_triggers not empty AND role is Provider or Deployer
    const hasTransparencyTriggers = answers.transparencyTriggers && answers.transparencyTriggers.length > 0 && !answers.transparencyTriggers.includes("none");
    const isProviderOrDeployer = roles.includes("Provider") || roles.includes("Deployer");
    if (hasTransparencyTriggers && isProviderOrDeployer) {
      obs.push("H");
    }

    // OBL_009: FRIA obligations (G1-G15) if (is_public_body OR sensitive_deployment_sector) AND high-risk
    const isPublicBody = answers.is_public_body === true;
    const hasSensitiveDeploymentSector = answers.deploymentSectors && 
      answers.deploymentSectors.length > 0 && 
      answers.deploymentSectors.some(s => ['law_enforcement', 'migration', 'border_control', 'justice'].includes(s));
    const requiresFRIA = (isPublicBody || hasSensitiveDeploymentSector) && isHighRisk;
    if (requiresFRIA) {
      obs.push("G");
    }

    // OBL_010: Non-Significant Risk obligations (I1-I7)
    if (classification === "annex_iii_non_significant") {
      obs.push("I");
    }

    // OBL_011: Prohibited obligations (L1-L9) if classification == Prohibited
    if (classification === "prohibited") {
      obs.push("L");
    }

    // OBL_016: Prohibited product manufacturer obligations (L' specific handling)
    // If prohibited AND is product manufacturer, add specific prohibited product manufacturer obligations
    if (classification === "prohibited" && roles.includes("Product_Manufacturer")) {
      obs.push("L_ProductManufacturer");
    }

    return obs;
  };

  // Save answer to wizard state
  const saveAnswer = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle checkbox answer
  const toggleAnswer = (field, value) => {
    setAnswers(prev => {
      const current = prev[field] || [];
      const isArray = Array.isArray(current);
      if (!isArray) return prev;
      
      if (current.includes(value)) {
        return {
          ...prev,
          [field]: current.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...current, value]
        };
      }
    });
  };

  // Toggle checklist item completion
  const toggleItemCompletion = (itemId) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Reset wizard
  const resetWizard = () => {
    setRoles_raw([]);
    setRoles([]);
    setAnswers({});
    setClassification(null);
    setObligations([]);
    setConformityRoute(null);
    setIsFria(false);
    setCompletedItems({});
    setNavigationHistory([]);
  };

  // Clear all answers and reset to home page state
  const clearAnswers = () => {
    setAnswers({});
    setClassification(null);
    setObligations([]);
    setConformityRoute(null);
    setIsFria(false);
    setCompletedItems({});
    setNavigationHistory([]);
    setRoles_raw([]);
    setRoles([]);
  };

  // Navigation history management
  const pushHistory = (screenPath) => {
    // Skip push if we're in the middle of navigating back
    if (isNavigatingBack) {
      return;
    }
    
    setNavigationHistory(prev => {
      // If we're going back to a path that exists in history, just truncate
      const existingIdx = prev.indexOf(screenPath);
      if (existingIdx !== -1) {
        // We're revisiting a step we've been to before - don't add it again
        return prev.slice(0, existingIdx + 1);
      }
      
      // Adding a new step - only add if it's different from the current last step
      if (prev.length > 0 && prev[prev.length - 1] === screenPath) {
        return prev; // No change, same screen
      }
      
      // New step - add to history
      return [...prev, screenPath];
    });
  };

  // Mark steps as completed in navigation history (for legitimately skipped steps)
  const markStepsAsCompleted = (stepPaths) => {
    setNavigationHistory(prev => {
      const updated = [...prev];
      stepPaths.forEach(stepPath => {
        if (!updated.includes(stepPath)) {
          updated.push(stepPath);
        }
      });
      return updated;
    });
  };

  const getPreviousScreen = () => {
    // If we have navigation history with 2+ items, use the actual previous screen
    if (navigationHistory.length > 1) {
      return navigationHistory[navigationHistory.length - 2];
    }
    
    // If we only have one screen in history (e.g., jumped directly to this page),
    // return the first screen (home)
    if (navigationHistory.length === 1) {
      return "/";
    }
    
    return "/"; // Default to home if no history
  };
  
  // Step ordering for proper back navigation
  const STEP_ORDER = [
    "/screen0",  // Screen 0: Information
    "/screen1",  // Screen 1: Exclusions
    "/screen2",  // Screen 2: Role
    "/screen3",  // Screen 3: AnnexIA
    "/screen4",  // Screen 4: AnnexIB
    "/screen5",  // Screen 5: AnnexIII Use-Cases
    "/screen6",  // Screen 6: AnnexIII Impact
    "/screen7",  // Screen 7: GPAI
    "/screen8",  // Screen 8: GPAI Systemic
    "/screen9",  // Screen 9: Prohibited
    "/screen10", // Screen 10: Transparency
    "/screen11", // Screen 11: FRIA
    "/screen12", // Screen 12: Final Classification
    "/screen13", // Screen 13: CA Route
    "/screen14", // Screen 14: CA Details
    "/screen15", // Screen 15: Checklist Output
  ];

  const ANSWER_KEYS_BY_STEP = {
    "/screen0": [],
    "/screen1": ["exclusions"],
    "/screen2": ["roles_raw"],
    "/screen3": ["annexIACategories"],
    "/screen4": ["highRiskSectorsB"],
    "/screen5": ["annexIIIUsecases"],
    "/screen6": ["impact_checks"],
    "/screen7": ["isGPAI"],
    "/screen8": ["hasSystemicRisk", "flopsValue"],
    "/screen9": ["prohibitedPractices"],
    "/screen10": ["transparencyTriggers"],
    "/screen11": ["is_public_body", "deploymentSectors"],
    "/screen12": ["finalClassification"],
    "/screen13": ["conformity_section_a", "conformity_section_b", "conformity_section_c", "conformity_section_d", "conformity_section_e", "conformityRoute"],
    "/screen14": ["obligationDetails"],
    "/screen15": ["completedItems"],
  };

  const clearAnswersAfter = (screenPath) => {
    const idx = STEP_ORDER.indexOf(screenPath);
    if (idx === -1) return;
    // Collect keys from steps after idx
    const keysToClear = [];
    for (let i = idx + 1; i < STEP_ORDER.length; i++) {
      const p = STEP_ORDER[i];
      const keys = ANSWER_KEYS_BY_STEP[p] || [];
      keys.forEach(k => {
        if (!keysToClear.includes(k)) keysToClear.push(k);
      });
    }
    if (keysToClear.length === 0) return;
    setAnswers(prev => {
      const copy = { ...prev };
      keysToClear.forEach(k => {
        if (k in copy) delete copy[k];
      });
      return copy;
    });
  };
  
  // ========== GLOBAL CLASSIFICATION PRECEDENCE RESOLVER ==========
  // Ensures all screens use consistent classification priority order
  // Per EU AI Act hierarchy (highest to lowest):
  // 1. Prohibited (Article 5) — terminal
  // 2. Excluded (Article 2) — terminal
  // 3. High-Risk (Annex I-A, I-B, III)
  // 4. GPAI with Systemic Risk
  // 5. GPAI (General Purpose AI)
  // 6. Annex III Non-Significant Risk
  // 7. In-Scope Non-High-Risk
  // 8. Out-of-Scope
  const getPrecedenceLevel = (classificationValue) => {
    if (!classificationValue) return -1;
    if (classificationValue === CLASSIFICATIONS.PROHIBITED) return 8; // Terminal, highest
    if (classificationValue === CLASSIFICATIONS.EXCLUDED) return 7;   // Terminal
    if (classificationValue === CLASSIFICATIONS.HIGH_RISK_IA) return 6;
    if (classificationValue === CLASSIFICATIONS.HIGH_RISK_IB) return 6;
    if (classificationValue === CLASSIFICATIONS.HIGH_RISK_III) return 6;
    if (classificationValue === CLASSIFICATIONS.GPAI_SYSTEMIC) return 5;
    if (classificationValue === CLASSIFICATIONS.GPAI) return 4;
    if (classificationValue === CLASSIFICATIONS.ANNEX_III_NON_SIGNIFICANT) return 3;
    if (classificationValue === CLASSIFICATIONS.IN_SCOPE_NON_HIGH_RISK) return 2;
    if (classificationValue === CLASSIFICATIONS.OUT_OF_SCOPE) return 1;
    return 0;
  };

  const resolvePrecedenceOrder = (classificationValue) => {
    if (!classificationValue) return null;

    // If no current classification, accept the new one
    if (!classification) {
      return classificationValue;
    }

    // Compare precedence levels: keep whichever is higher
    const newLevel = getPrecedenceLevel(classificationValue);
    const currentLevel = getPrecedenceLevel(classification);

    if (newLevel >= currentLevel) {
      return classificationValue;
    } else {
      return classification; // Keep existing if it has higher precedence
    }
  };

  // Wrapper for setClassification that applies precedence
  const setClassificationWithPrecedence = (newClassification) => {
    const resolved = resolvePrecedenceOrder(newClassification);
    if (resolved !== classification) {
      if (newClassification !== resolved) {
        console.log(
          `Classification precedence applied: ${newClassification} → ${resolved}`
        );
      }
      setClassification(resolved);
    }
  };
  
  // Navigate back helper: confirm, clear later answers, then navigate
  const navigateBack = (navigate) => {
    const prev = getPreviousScreen();
    if (!prev) return;
    const ok = window.confirm("Navigating back will erase progress made after this step. Continue?");
    if (!ok) return;
    
    // Set flag to prevent history push during navigation
    setIsNavigatingBack(true);
    
    // Clear answers for all steps after the target step
    clearAnswersAfter(prev);
    
    // Set flag to force re-evaluation of rules on next screen
    setShouldReevaluateRules(true);
    
    // Update history to remove the current and all subsequent steps
    setNavigationHistory(prevHistory => prevHistory.slice(0, prevHistory.indexOf(prev) + 1));
    
    // Navigate to previous screen
    navigate(prev);
    
    // Clear the flag after a brief delay to allow navigation to complete
    setTimeout(() => {
      setIsNavigatingBack(false);
    }, 100);
  };

  const value = {
    // State
    roles_raw,
    setRoles_raw,
    roles,
    setRoles,
    answers,
    saveAnswer,
    toggleAnswer,
    classification,
    setClassification,
    setClassificationWithPrecedence,
    obligations,
    setObligations,
    conformityRoute,
    setConformityRoute,
    isFria,
    setIsFria,
    completedItems,
    toggleItemCompletion,
    navigationHistory,
    pushHistory,
    getPreviousScreen,
    markStepsAsCompleted,
    clearAnswersAfter,
    clearAnswers,
    navigateBack,
    shouldReevaluateRules,
    setShouldReevaluateRules,
    
    // Computed
    hasModifications,
    hasHighRiskB,
    hasAnnexIA,
    hasAnnexIII,
    hasExclusions,
    hasProhibited,
    
    // Module 2B & Module 11 Engines
    reclassifyRoles,
    computeObligations,
    resolvePrecedenceOrder,
    
    // Utils
    resetWizard
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return context;
}
