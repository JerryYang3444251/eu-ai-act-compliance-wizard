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
  const [shouldReevaluateRules, setShouldReevaluateRules] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  // FRIA-specific state (FRIA_001 rule requirements)
  const [isPublicServiceProvider, setIsPublicServiceProvider] = useState(null);
  const [deploymentSector, setDeploymentSector] = useState([]);
  const [annexIIIPoint, setAnnexIIIPoint] = useState(null);

  // Transparency-specific state (TRANS_001-005 requirements)
  const [systemFunctionality, setSystemFunctionality] = useState([]);
  const [contentCharacteristics, setContentCharacteristics] = useState([]);

  // GPAI-specific state (GPAI_003-005 requirements)
  const [commissionDesignation, setCommissionDesignation] = useState(false);

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

  // High-risk flag for optimization
  const isHighRisk = classification && [
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  // MODULE 2: RAW ROLE IDENTIFICATION
  // Phase 1: org_actions → roles_raw (intermediate tags)
  const identifyRawRoles = (org_actions) => {
    const raw_role_tags = new Set();

    // ROLE_001a: Original Development — developing a new system/model from scratch → Provider unconditionally
    // Article 3(3): entity that develops and places on the market under own name/trademark
    if (org_actions.some(a => ['develop_system', 'develop_model'].includes(a))) {
      raw_role_tags.add('Original_Development');
    }

    // ROLE_001b: Substantial Modification → Provider conditionally
    // change_purpose is definitionally substantial per Article 3(23) — always applies.
    // modify: only substantial if (a) no base operational role (standalone developer), or
    //         (b) confirmed substantial via answers.isSubstantialModification === 'yes' (Phase 2 gate).
    const hasBaseOperationalAction = org_actions.some(a => ['deploy', 'import', 'distribute', 'product_manufacturer'].includes(a));
    const hasModifyAction = org_actions.includes('modify');
    const hasChangePurposeAction = org_actions.includes('change_purpose');
    const modifyIsSubstantial = hasModifyAction && (!hasBaseOperationalAction || answers.isSubstantialModification === 'yes');
    if (modifyIsSubstantial || hasChangePurposeAction) {
      raw_role_tags.add('Substantial_Modification');
    }

    // ROLE_002: Branding tag
    if (org_actions.includes('brand')) {
      raw_role_tags.add('Branding');
    }

    // ROLE_003: Importer tag
    if (org_actions.includes('import')) {
      raw_role_tags.add('Importer');
    }

    // ROLE_004: Distributor tag
    if (org_actions.includes('distribute')) {
      raw_role_tags.add('Distributor');
    }

    // ROLE_005: Market_Placer tag
    if (org_actions.includes('place_on_market')) {
      raw_role_tags.add('Market_Placer');
    }

    // ROLE_006: Deployer tag
    if (org_actions.includes('deploy')) {
      raw_role_tags.add('Deployer');
    }

    // ROLE_007: Product_Manufacturer tag
    if (org_actions.includes('product_manufacturer')) {
      raw_role_tags.add('Product_Manufacturer');
    }

    // ROLE_009: Authorised Representative tag
    if (org_actions.includes('act_as_ar')) {
      raw_role_tags.add('Authorised_Representative');
    }

    // ROLE_008: Validation
    if (raw_role_tags.size === 0) {
      console.warn("ROLE_008: No raw roles identified from org_actions", { org_actions });
    }

    return Array.from(raw_role_tags);
  };

  // MODULE 2B: Legal role reclassification
  // Phase 2: roles_raw (tags) → roles (legal)
  const reclassifyRoles = (raw_actions) => {
    // First, get raw role tags from org_actions (MODULE 2)
    const roles_raw_tags = identifyRawRoles(raw_actions);
    
    const legal_roles = new Set();
    let provider_assigned = false;

    // Track WHICH operational roles were themselves the source of Provider reclassification.
    // These are the only ones that get absorbed into Provider.
    // Operational roles reclassified from an INDEPENDENT Provider source (e.g. develop_model)
    // must be retained alongside Provider — they represent separate compliance obligations.
    let deployer_absorbed = false;
    let importer_absorbed = false;
    let distributor_absorbed = false;
    let product_manufacturer_absorbed = false;

    // RECLASS_001a: Original_Development → PROVIDER (unconditional — Article 3(3))
    if (roles_raw_tags.includes('Original_Development')) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // RECLASS_001b: REMOVED — merged into RECLASS_007.
    // A standalone modifier (no base operational role) who substantially modifies a high-risk AI system
    // is subject to Art. 25(1)(b)/(c), which requires isHighRisk — identical to the operational-role path.
    // There is no unconditional Provider path for modification activities: Art. 25 applies to ALL
    // "distributors, importers, deployers or other third parties", and always requires high-risk.

    // RECLASS_002: Branding alone (non-developer) → PROVIDER
    // Article 25(1)(a): only applies when the system is HIGH-RISK.
    // A non-developer who merely places a minimal-risk system under their own name
    // does NOT become a Provider. Late binding: fires only when isHighRisk is confirmed.
    // Note: if Original_Development is also set, RECLASS_001a already assigned Provider;
    // this rule is a no-op in that case but kept for completeness.
    if (roles_raw_tags.includes('Branding') && isHighRisk) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // RECLASS_003: Market_Placer → PROVIDER (Article 3(3), Article 16)
    // Placing on market under own name implies being the developer/commercialiser — unconditional.
    if (roles_raw_tags.includes('Market_Placer')) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // RECLASS_004: Product_Manufacturer + safety component → PROVIDER (Article 25(3))
    // The product manufacturer role is absorbed only when the safety component trigger fires.
    if (roles_raw_tags.includes('Product_Manufacturer')) {
      if (answers.safety_function === "yes") {
        legal_roles.add("Provider");
        provider_assigned = true;
        product_manufacturer_absorbed = true;
      }
    }

    // RECLASS_005: Importer + Branding → PROVIDER (Article 25(1)(a))
    // HIGH-RISK ONLY — late binding.
    // For non-high-risk systems, the Importer retains their base role.
    if (roles_raw_tags.includes('Importer') && roles_raw_tags.includes('Branding') && isHighRisk) {
      legal_roles.add("Provider");
      provider_assigned = true;
      importer_absorbed = true;
    }

    // RECLASS_006: Distributor + Branding → PROVIDER (Article 25(1)(a))
    // HIGH-RISK ONLY — late binding.
    if (roles_raw_tags.includes('Distributor') && roles_raw_tags.includes('Branding') && isHighRisk) {
      legal_roles.add("Provider");
      provider_assigned = true;
      distributor_absorbed = true;
    }

    // RECLASS_007: Substantial_Modification → PROVIDER (Article 25(1)(b)/(c), Article 3(3))
    // HIGH-RISK ONLY — applies to ALL actors (Deployer, Importer, Distributor, or standalone third party).
    //
    // Art. 25(1)(b): substantial modification of an ALREADY-high-risk system → system remains high-risk.
    // Art. 25(1)(c): change of intended purpose making a NON-high-risk system BECOME high-risk.
    //
    // Both paths require isHighRisk (the system is high-risk after the modification/repurposing).
    // Late binding: fires only when isHighRisk is confirmed from Parts 3–6.
    //
    // Absorb flags: operational roles that were THEMSELVES the source of reclassification are absorbed
    // into Provider so they are not also retained as independent roles (RECLASS_008–010).
    if (roles_raw_tags.includes('Substantial_Modification') && isHighRisk) {
      legal_roles.add("Provider");
      provider_assigned = true;
      if (roles_raw_tags.includes('Deployer')) deployer_absorbed = true;
      if (roles_raw_tags.includes('Importer') && !importer_absorbed) importer_absorbed = true;
      if (roles_raw_tags.includes('Distributor') && !distributor_absorbed) distributor_absorbed = true;
    }

    // RECLASS_008: Deployer → DEPLOYER when NOT absorbed into Provider.
    // Important: if Provider was assigned from a different activity (e.g. develop_model),
    // the Deployer role must still be retained — Article 26 obligations are independent of
    // Article 53 GPAI model obligations and Article 16 system provider obligations.
    if (roles_raw_tags.includes('Deployer') && !deployer_absorbed) {
      legal_roles.add("Deployer");
    }

    // RECLASS_009: Importer → IMPORTER when NOT absorbed into Provider.
    if (roles_raw_tags.includes('Importer') && !importer_absorbed) {
      legal_roles.add("Importer");
    }

    // RECLASS_010: Distributor → DISTRIBUTOR when NOT absorbed into Provider.
    if (roles_raw_tags.includes('Distributor') && !distributor_absorbed) {
      legal_roles.add("Distributor");
    }

    // RECLASS_011: Product_Manufacturer → PRODUCT_MANUFACTURER when NOT absorbed into Provider.
    if (roles_raw_tags.includes('Product_Manufacturer') && !product_manufacturer_absorbed) {
      if (answers.safety_function !== "yes") {
        legal_roles.add("Product_Manufacturer");
      }
    }

    // RECLASS_015: Authorised_Representative → AUTHORISED_REPRESENTATIVE (Article 22)
    if (roles_raw_tags.includes('Authorised_Representative')) {
      legal_roles.add("Authorised_Representative");
    }

    // RECLASS_014: Model relationship provider selection → PROVIDER
    // If user explicitly selected "provider" relationship in Part 7 (GPAI section)
    // Assign Provider role for GPAI systemic providers
    if ((answers.modelRelationship === "provider" && !provider_assigned) ||
        (classification === CLASSIFICATIONS.GPAI_SYSTEMIC && answers.modelRelationship === "provider")) {
      legal_roles.add("Provider");
      provider_assigned = true;
    }

    // RECLASS_012: Deduplicate roles
    const deduplicated = Array.from(legal_roles);

    // RECLASS_013: Error if empty
    if (deduplicated.length === 0) {
      console.warn("ROLE_RECLASS_013: No legal roles determined from roles_raw", { roles_raw_tags, raw_actions });
      return [];
    }

    // Return computed legal roles for next screen
    return deduplicated;
  };

  // MODULE 11: OBLIGATION ENGINE
  // Computes applicable obligations per Rules OBL_001-017 + OBL_PRECEDENCE_001
  // OBL_PRECEDENCE_001: Prohibited takes absolute precedence
  const computeObligations = () => {
    const obs = [];

    // OBL_PRECEDENCE_001: Prohibited classification takes absolute precedence
    // Article 5 (Prohibited) supersedes all other obligations
    // When prohibited, ONLY L-series (and P for Product_Manufacturer) apply
    if (classification === CLASSIFICATIONS.PROHIBITED) {
      if (roles.includes("Provider")) obs.push("L");
      if (roles.includes("Importer")) obs.push("L");
      if (roles.includes("Distributor")) obs.push("L");
      if (roles.includes("Deployer")) obs.push("L");
      if (roles.includes("Product_Manufacturer")) {
        obs.push("L");
        obs.push("P");
      }
      return obs;
    }

    // Normal obligations (non-prohibited systems only)

    // OBL_001: Provider obligations (A1-A16) - Chapter III, Section 2
    if (roles.includes("Provider") && isHighRisk) obs.push("A");
    // OBL_017: Handover (C1-C15) only if Provider AND high-risk classification
    if (roles.includes("Provider") && isHighRisk) obs.push("C");
    // OBL_002: Importer obligations (D1-D14) - Article 23 — high-risk AI systems only
    if (roles.includes("Importer") && isHighRisk) obs.push("D");
    // OBL_003: Distributor obligations (E1-E9) - Article 24 — high-risk AI systems only
    if (roles.includes("Distributor") && isHighRisk) obs.push("E");
    // OBL_004: Deployer obligations (F1-F13) - Article 26 — high-risk AI systems only
    if (roles.includes("Deployer") && isHighRisk) obs.push("F");

    // OBL_009: FRIA obligations (G1-G15) - Article 27
    const isPublicAuthority = roles.includes("Public_Authority");
    const hasSensitiveDeploymentSector = deploymentSector?.some(sector =>
      [
        'biometrics', 'education', 'employment', 'essential_services', 'law_enforcement',
        'migration', 'asylum', 'border_control', 'migration_asylum_border', 'justice'
      ].includes(sector)
    );
    const hasAnnexIII_5b_5c = answers.annexIIIUsecases?.some(usecase =>
      ['services_creditworthiness', 'services_insurance'].includes(usecase)
    );
    const requiresFRIA =
      isHighRisk &&
      annexIIIPoint !== 2 &&
      (isPublicAuthority || isPublicServiceProvider || hasSensitiveDeploymentSector || hasAnnexIII_5b_5c);
    if (requiresFRIA) obs.push("G");

    // OBL_008: Transparency obligations (H1-H9) - Article 50 only
    const hasArticle50Triggers =
      (systemFunctionality && systemFunctionality.length > 0 && !systemFunctionality.includes("none")) ||
      (answers.transparencyTriggers && answers.transparencyTriggers.length > 0 && !answers.transparencyTriggers.includes("none"));
    const isProviderOrDeployer = roles.includes("Provider") || roles.includes("Deployer");
    if (hasArticle50Triggers && isProviderOrDeployer) obs.push("H");

    // OBL_010: Non-Significant Risk obligations (I1-I7)
    if (classification === CLASSIFICATIONS.ANNEX_III_NON_SIGNIFICANT && roles.includes("Provider")) obs.push("I");

    // DUAL-ROLE LOGIC: Assign both high-risk and GPAI obligations if both apply, regardless of classification precedence
    const isModelProvider = answers.modelRelationship === "provider";

    // Phase 4 guard: modification-triggered providers only receive system-level obligations if
    // (a) they are original developers (develop_system / develop_model), or
    // (b) their modification was confirmed substantial (answers.isSubstantialModification === 'yes'),
    // (c) change_purpose is always substantial per Article 3(23).
    const isOriginalDeveloper = roles_raw.some(a => ['develop_system', 'develop_model'].includes(a));
    const isModificationTriggeredOnly = !isOriginalDeveloper && roles_raw.some(a => ['modify', 'change_purpose'].includes(a));
    const modificationConfirmed = !isModificationTriggeredOnly
      || roles_raw.includes('change_purpose')
      || answers.isSubstantialModification === 'yes';

    // isSystemProvider: true for (a) directly classified high-risk, or (b) GPAI/GPAI_SYSTEMIC provider
    // who also touches high-risk use cases (dual-role). Explicitly excludes ANNEX_III_NON_SIGNIFICANT
    // and IN_SCOPE_NON_HIGH_RISK to avoid incorrectly pushing A/C/O for non-high-risk providers
    // who still have annexIII answers filled in from the wizard journey.
    const isSystemProvider = roles.includes("Provider") && modificationConfirmed && (
      // Direct high-risk classification
      [CLASSIFICATIONS.HIGH_RISK_IA, CLASSIFICATIONS.HIGH_RISK_IB, CLASSIFICATIONS.HIGH_RISK_III].includes(classification)
      || (
        // Dual-role: GPAI model that also has high-risk system exposure
        [CLASSIFICATIONS.GPAI, CLASSIFICATIONS.GPAI_SYSTEMIC].includes(classification) && (
          (answers.annexIACategories && answers.annexIACategories.some(x => x !== "none"))
          || (answers.highRiskSectorsB && answers.highRiskSectorsB.some(x => x !== "none"))
          || (answers.annexIIIUsecases && answers.annexIIIUsecases.some(x => x !== "none"))
        )
      )
    );
    const isGPAI = isModelProvider && (
      classification === CLASSIFICATIONS.GPAI || classification === CLASSIFICATIONS.GPAI_SYSTEMIC || answers.isGPAI === "yes"
    );
    const isGPAISystemic = isModelProvider && (
      classification === CLASSIFICATIONS.GPAI_SYSTEMIC || answers.hasSystemicRisk === "yes" || answers.hasSystemicRisk === "commission_determined"
    );

    // Always add high-risk obligations if system provider
    if (isSystemProvider) {
      obs.push("A");
      obs.push("C");
      if (classification !== CLASSIFICATIONS.HIGH_RISK_IB) {
        obs.push("O");
      }
    }
    // Always add GPAI obligations if model provider and GPAI
    if (isGPAI) {
      obs.push("J");
    }
    // Always add GPAI Systemic obligations if model provider and GPAI systemic
    if (isGPAISystemic) {
      obs.push("K");
    }

    // OBL_015: Product Manufacturer obligations (N1-N4) - Article 25(3) — high-risk AI systems only
    // Article 25(3): product manufacturer becomes Provider only when the AI is a high-risk safety component
    if (roles.includes("Product_Manufacturer") && isHighRisk) obs.push("N");

    // OBL_019: AI Literacy (Q) - Article 4
    // Universal obligation for all providers and deployers, regardless of risk level
    // For high-risk systems, AI literacy is also embedded in A18/F14; push Q here for non-high-risk only
    if (!isHighRisk && (roles.includes("Provider") || roles.includes("Deployer"))) obs.push("Q");

    // OBL_007: Conformity Assessment obligations (O1-O50 by route)
    // Only for Providers with high-risk classification per Article 43
    // EXCLUDE HIGH_RISK_IB: Per Article 2(2), Annex I Section B systems follow sectoral legislation only
    if (roles.includes("Provider") && isHighRisk && classification !== CLASSIFICATIONS.HIGH_RISK_IB) {
      obs.push("O");
      // Note: O obligations filtered by conformityRoute in screen rendering
    }

    // M: Exclusion Documentation (Article 2)
    // Added when system is excluded from scope
    if (classification === CLASSIFICATIONS.EXCLUDED) {
      obs.push("M");
    }

    // OBL_018: Authorised Representative obligations (R1-R6) - Article 22
    if (roles.includes("Authorised_Representative")) obs.push("R");

    // X: Exemption Documentation (Article 5 & Recital 16)
    // Added when prohibited practices are selected but valid exemptions apply
    const hasValidExemptions = answers.prohibitedPractices && 
      answers.prohibitedPractices.some(practice => practice !== "none") &&
      answers.prohibitedExceptions &&
      Object.values(answers.prohibitedExceptions).some(exemption => exemption === true);
    
    // Also check for ancillary feature exemption claims
    const hasAncillaryFeatureExemption = answers.ancillaryFeature === true;
    
    if (hasValidExemptions || hasAncillaryFeatureExemption) {
      obs.push("X");
    }

    return obs;
  };

  // Re-run role reclassification when safety_function or modelRelationship changes
  // This handles provider reclassification from Part 7 GPAI section and Part 2 safety components
  useEffect(() => {
    if (roles_raw.length > 0) {
      try {
        const recomputedRoles = reclassifyRoles(roles_raw);
        // Only update if roles actually changed to avoid infinite loops
        if (JSON.stringify(recomputedRoles) !== JSON.stringify(roles)) {
          setRoles(recomputedRoles);
        }
      } catch (e) {
        console.warn("Error re-classifying roles:", e);
      }
    }
  }, [answers.safety_function, answers.modelRelationship, roles_raw, classification]);

  // Automatically persist computed obligations whenever inputs change
  useEffect(() => {
    try {
      const obs = computeObligations();
      setObligations(obs);
    } catch (e) {
      console.warn("Error computing obligations:", e);
    }
  // Recompute when legal roles, classification, conformityRoute, or relevant context changes
  }, [
    roles, 
    classification, 
    conformityRoute, 
    systemFunctionality,
    answers.transparencyTriggers, 
    isPublicServiceProvider,
    deploymentSector,
    annexIIIPoint,
    answers.flopsValue,
    commissionDesignation,
    answers.annexIIIUsecases, 
    answers.prohibitedPractices,
    answers.prohibitedExceptions,
    answers.ancillaryFeature
  ]);

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
    setIsPublicServiceProvider(null);
    setDeploymentSector([]);
    setAnnexIIIPoint(null);
    setSystemFunctionality([]);
    setContentCharacteristics([]);
    setCommissionDesignation(false);
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
    setIsPublicServiceProvider(null);
    setDeploymentSector([]);
    setAnnexIIIPoint(null);
    setSystemFunctionality([]);
    setContentCharacteristics([]);
    setCommissionDesignation(false);
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
    "/",         // Home
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
    "/screen14", // Screen 14: Checklist Output
  ];

  const ANSWER_KEYS_BY_STEP = {
    "/": [],
    "/screen1": ["exclusions"],
    "/screen2": ["roles_raw"],
    "/screen3": ["annexIACategories"],
    "/screen4": ["highRiskSectorsB"],
    "/screen5": ["annexIIIUsecases"],
    "/screen6": ["impact_checks", "profiling"],
    "/screen7": ["isGPAI"],
    "/screen8": ["hasSystemicRisk", "flopsValue", "commissionDesignation"],
    "/screen9": ["prohibitedPractices"],
    "/screen10": ["transparencyTriggers", "systemFunctionality", "contentCharacteristics"],
    "/screen11": ["is_public_body", "isPublicServiceProvider", "deploymentSectors", "annexIIIPoint"],
    "/screen12": ["finalClassification"],
    "/screen13": ["conformity_section_a", "conformity_section_b", "conformity_section_c", "conformity_section_d", "conformity_section_e", "conformityRoute"],
    "/screen14": ["completedItems"],
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

    // Also clear state variables associated with later steps
    const stateVariablesToClear = {
      // classification is first set at Screen 3 — clear it (and the derived roles state) whenever
      // navigating back to Screen 2 or earlier so reclassifyRoles() in Screen 2 never sees a stale
      // isHighRisk and does not fire high-risk-only reclassification rules (RECLASS_002/005/006/007)
      // before Parts 3–6 have been completed.
      "/screen3": () => { setClassification(null); setRoles([]); },
      "/screen8": () => setCommissionDesignation(false),
      "/screen10": () => {
        setSystemFunctionality([]);
        setContentCharacteristics([]);
      },
      "/screen11": () => {
        setIsPublicServiceProvider(null);
        setDeploymentSector([]);
        setAnnexIIIPoint(null);
      },
    };

    // Clear state for all steps after the target step
    for (let i = idx + 1; i < STEP_ORDER.length; i++) {
      const stepPath = STEP_ORDER[i];
      if (stateVariablesToClear[stepPath]) {
        stateVariablesToClear[stepPath]();
      }
    }
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

  // Helper: Detect if Annex III system is biometric (point 1) vs non-biometric (points 2-8)
  // Article 43(1) applies to point 1, Article 43(2) applies to points 2-8
  const isBiometricAnnexIII = () => {
    const usecases = answers.annexIIIUsecases || [];
    const biometricCases = ['biometric_rbi', 'biometric_categorisation', 'emotion_recognition'];
    return usecases.some(id => biometricCases.includes(id));
  };

  const value = {
    // ========== STATE ==========
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
    
    // FRIA context (Article 27)
    isPublicServiceProvider,
    setIsPublicServiceProvider,
    deploymentSector,
    setDeploymentSector,
    annexIIIPoint,
    setAnnexIIIPoint,

    // Transparency context (Article 50)
    systemFunctionality,
    setSystemFunctionality,
    contentCharacteristics,
    setContentCharacteristics,

    // GPAI context (Articles 51, 55)
    commissionDesignation,
    setCommissionDesignation,

    // Computed flags
    hasModifications,
    hasHighRiskB,
    hasAnnexIA,
    hasAnnexIII,
    hasExclusions,
    hasProhibited,
    isHighRisk, // NEW: Commonly used flag
    
    // ========== MODULE 2B & MODULE 11 ENGINES ==========
    reclassifyRoles,
    computeObligations,
    resolvePrecedenceOrder,
    isBiometricAnnexIII,
    
    // ========== UTILS ==========
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
