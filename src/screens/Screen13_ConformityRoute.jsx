import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CONFORMITY_ASSESSMENT_ROUTES, CLASSIFICATIONS } from "../data/checklist";

export default function Screen13A() {
  const navigate = useNavigate();
  const {
    roles,
    answers,
    saveAnswer,
    setConformityRoute,
    classification,
    navigateBack,
    shouldReevaluateRules,
    setShouldReevaluateRules,
    pushHistory,
    isBiometricAnnexIII,
  } = useWizard();

  useEffect(() => {
    pushHistory("/screen13");
  }, [pushHistory]);
  
  // Conformity Assessment only for Providers with High-Risk classification
  const isProvider = roles.includes("Provider");
  
  const requiresCA =
    isProvider &&
    classification &&
    [
      CLASSIFICATIONS.HIGH_RISK_IA,
      CLASSIFICATIONS.HIGH_RISK_IB,
      CLASSIFICATIONS.HIGH_RISK_III,
    ].includes(classification);

  // Skip conformity assessment screen if not required
  useEffect(() => {
    if (!requiresCA) {
      navigate("/screen14");
    }
  }, [requiresCA, navigate]);

  if (!requiresCA) return null;

  // Determine which Article 43 paragraph applies
  const isAnnexIB = classification === CLASSIFICATIONS.HIGH_RISK_IB;
  const isAnnexIA = classification === CLASSIFICATIONS.HIGH_RISK_IA;
  const isAnnexIII = classification === CLASSIFICATIONS.HIGH_RISK_III;
  const isBiometric = isAnnexIII && isBiometricAnnexIII();
  const isNonBiometric = isAnnexIII && !isBiometric;

  // Retrieve answers
  const sectoralLaw = answers.conformity_sectoral_law || [];
  const harmonizedStandardsApplied = answers.conformity_hs_applied; // "full" / "partial" / "none" / null
  const userChoice = answers.conformity_user_choice; // "internal" / "notified_body" / null
  
  // Link Part 3 (Annex IA categories) to Part 13 (sectoral legislation)
  const annexIACategories = answers.annexIACategories || [];
  
  // Mapping between Annex IA categories and sectoral legislation
  const getAutoSectoralLaw = () => {
    const mapping = {
      'medical_devices': 'mdr',
      'ivd_devices': 'ivdr', 
      'machinery': 'machinery',
      'toys': 'toys',
      'lifts': 'lifts',
      'atex': 'atex',
      'radio': 'radio', 
      'pressure': 'pressure',
      'cableway': 'cableways',
      'ppe': 'ppe',
      'gas': 'gas',
      'recreational_craft': 'recreational'
    };
    
    return annexIACategories
      .filter(category => category !== 'none' && mapping[category])
      .map(category => mapping[category]);
  };

  // Detect inconsistency between auto-populated and current selections
  const detectSectoralInconsistency = () => {
    if (!isAnnexIA || !annexIACategories.length || annexIACategories.includes('none')) return null;
    
    const expectedSectoral = getAutoSectoralLaw();
    if (!expectedSectoral.length) return null;
    
    const currentSectoral = sectoralLaw || [];
    
    // Check if current selection significantly differs from expected
    const hasMajorDeviation = expectedSectoral.some(expected => !currentSectoral.includes(expected)) ||
                             currentSectoral.some(current => current !== 'none' && !expectedSectoral.includes(current));
    
    if (!hasMajorDeviation) return null;
    
    const sectoralLabels = {
      'mdr': 'Medical Devices (MDR)',
      'ivdr': 'IVD Devices (IVDR)', 
      'machinery': 'Machinery',
      'toys': 'Toys',
      'lifts': 'Lifts',
      'atex': 'ATEX',
      'radio': 'Radio Equipment',
      'pressure': 'Pressure Equipment',
      'cableways': 'Cableways',
      'ppe': 'PPE',
      'gas': 'Gas Appliances',
      'recreational': 'Recreational Craft'
    };
    
    return {
      expected: expectedSectoral.map(s => sectoralLabels[s] || s).join(', '),
      current: currentSectoral.includes('none') ? 'None' : currentSectoral.map(s => sectoralLabels[s] || s).join(', ')
    };
  };

  const sectoralInconsistency = detectSectoralInconsistency();
  
  // Auto-populate sectoral law if not already set and we have Annex IA categories
  useEffect(() => {
    if (isAnnexIA && sectoralLaw.length === 0 && annexIACategories.length > 0) {
      const autoSectoralLaw = getAutoSectoralLaw();
      if (autoSectoralLaw.length > 0) {
        saveAnswer('conformity_sectoral_law', autoSectoralLaw);
      }
    }
  }, [isAnnexIA, annexIACategories, sectoralLaw.length]);

  // Handler for toggle options
  const handleToggleSectoral = (id) => {
    const current = sectoralLaw;
    if (id === "none") {
      if (current.includes("none")) {
        saveAnswer("conformity_sectoral_law", []);
      } else {
        saveAnswer("conformity_sectoral_law", ["none"]);
      }
    } else {
      if (current.includes("none")) {
        saveAnswer("conformity_sectoral_law", [id]);
      } else {
        if (current.includes(id)) {
          saveAnswer("conformity_sectoral_law", current.filter(item => item !== id));
        } else {
          saveAnswer("conformity_sectoral_law", [...current, id]);
        }
      }
    }
  };

  // MODULE 10: CA ROUTING (Article 43)
  const determineRoute = () => {
    // Article 2(2): Annex I Section B (HIGH_RISK_IB) - Follow sectoral legislation only
    if (isAnnexIB) {
      return CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION;
    }

    // CA_ARTICLE_43_3: Annex I Section A (HIGH_RISK_IA) - Follow sectoral legislation
    if (isAnnexIA) {
      return CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION;
    }

    // CA_ARTICLE_43_2: Annex III points 2-8 (Non-biometric) - MUST use internal control
    if (isNonBiometric) {
      return CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL;
    }

    // CA_ARTICLE_43_1: Annex III point 1 (Biometric)
    if (isBiometric) {
      // Mandatory notified body if:
      // - HS don't exist / CS not available
      // - Provider hasn't applied or only partially applied HS
      // - CS exist but provider hasn't applied them
      // - HS published with restrictions
      if (harmonizedStandardsApplied === "none" || harmonizedStandardsApplied === "partial") {
        return CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY;
      }

      // Optional: Provider can choose if HS/CS fully applied
      if (harmonizedStandardsApplied === "full") {
        return userChoice === "internal" 
          ? CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL 
          : CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY;
      }
    }

    // Fallback (should not reach here)
    return CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY;
  };

  const route = determineRoute();

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    // Validation (skip for Annex IB as it's informational only)
    if (isAnnexIA && sectoralLaw.length === 0) {
      alert("Please select the applicable sectoral legislation.");
      return;
    }

    if (isBiometric) {
      if (!harmonizedStandardsApplied) {
        alert("Please indicate whether harmonized standards or common specifications have been applied.");
        return;
      }
      if (harmonizedStandardsApplied === "full" && !userChoice) {
        alert("Please choose your conformity assessment procedure.");
        return;
      }
    }

    setConformityRoute(route);
    navigate("/screen14");
  };

  // ---------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------
  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 13: Conformity Assessment Route</h1>
        <p className="subtitle">Determine your conformity assessment route. <span className="source-tag" title="Article 43">Source</span></p>
      </div>

      <div className="screen-content">

        {/* ANNEX I SECTION B (HIGH_RISK_IB) - Article 2(2) */}
        {isAnnexIB && (
          <div className="form-group">
            <div className="info-box alert-info">
              <h3>
                Annex I Section B - Sectoral Legislation Applies
                <span className="source-tag" title="Article 2(2)">Source</span>
              </h3>
              <p>
                Your AI system is a safety component of a product covered by Union harmonisation 
                legislation listed in Annex I Section B. Only specific articles of the AI Act apply (Articles 6(1), 102-109, and 112)
              </p>
              <p style={{marginTop: "12px"}}>
                <strong> Conformity Assessment:</strong> Follow the conformity assessment procedures required 
                under your applicable sectoral legislation (e.g., Medical Devices Regulation, Machinery Directive, 
                Toy Safety Directive, etc.). The AI Act conformity assessment procedures do not apply.
              </p>
            </div>
          </div>
        )}

        {/* Auto-selection banner */}
        {isAnnexIA && annexIACategories.length > 0 && !annexIACategories.includes('none') && (
          <div className="info-box alert-info" style={{ marginBottom: "24px" }}>
            <strong>ℹ️ Auto-Selection:</strong> Based on your Part 3 Annex IA categories, we've pre-selected the applicable sectoral legislation below. You can change these selections if they don't match your situation.
          </div>
        )}

        {/* Inconsistency warning */}
        {sectoralInconsistency && (
          <div className="info-box alert-warning" style={{ marginBottom: "24px" }}>
            <strong>⚠️ Potential Inconsistency:</strong> Your current sectoral legislation selection (<strong>{sectoralInconsistency.current}</strong>) differs from your Part 3 Annex IA categories, which suggest <strong>{sectoralInconsistency.expected}</strong>. Please verify this is correct for your situation.
          </div>
        )}

        {/* ANNEX I SECTION A (HIGH_RISK_IA) - Article 43(3) */}
        {isAnnexIA && (
          <div className="form-group">
            <h3>
              Sectoral Legislation
              <span className="source-tag" title="Article 43(3), Annex I Section A">Source</span>
            </h3>
            <p className="subtle">
              Your AI system is covered by Union harmonisation legislation listed in Annex I Section A.
            </p>
            <p className="subtle" style={{marginTop: '8px'}}>
              Select the applicable sectoral law(s):
            </p>

            <div className="options-group checkbox-group">
              {[
                ["mdr", "Medical Devices Regulation (MDR) - Regulation (EU) 2017/745"],
                ["ivdr", "In Vitro Diagnostics Regulation (IVDR) - Regulation (EU) 2017/746"],
                ["machinery", "Machinery Regulation - Directive 2006/42/EC"],
                ["toys", "Toy Safety Directive - Directive 2009/48/EC"],
                ["lifts", "Lifts Regulation - Directive 2014/33/EU"],
                ["atex", "ATEX Directive - Directive 2014/34/EU"],
                ["radio", "Radio Equipment Directive - Directive 2014/53/EU"],
                ["pressure", "Pressure Equipment Directive - Directive 2014/68/EU"],
                ["cableways", "Cableways Regulation - Regulation (EU) 2016/424"],
                ["ppe", "PPE Regulation - Regulation (EU) 2016/425"],
                ["gas", "Gas Appliances Regulation - Regulation (EU) 2016/426"],
                ["recreational", "Recreational Craft Directive - Directive 2013/53/EU"],
                ["none", "None of the above"],
              ].map(([id, label]) => (
                <label key={id} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={sectoralLaw.includes(id)}
                    onChange={() => handleToggleSectoral(id)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ANNEX III NON-BIOMETRIC (points 2-8) - Article 43(2) */}
        {isNonBiometric && (
          <div className="form-group">
            <h3>
              Non-Biometric High-Risk AI System
              <span className="source-tag" title="Article 43(2)">Source</span>
            </h3>
            <p className="subtle">
              Your AI system is classified as high-risk under Annex III points 2-8 (non-biometric use cases).
            </p>

            <div style={{marginTop: "20px"}}>
              <h4>Harmonized Standards / Common Specifications</h4>
              <p className="subtle">
                For non-biometric high-risk AI systems, the conformity assessment procedure is based on internal control (Annex VI). Notified body assessment is not available for these systems.
              </p>
              <div className="options-group radio-group" style={{opacity: 0.6, pointerEvents: 'none'}}>
                <label className="radio-option">
                  <input type="radio" checked readOnly />
                  <span>Internal Control (Annex VI) – Self-assessment only</span>
                </label>
                <label className="radio-option">
                  <input type="radio" disabled />
                  <span>Notified Body (Annex VII) – <em>Not available</em></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ANNEX III BIOMETRIC (point 1) - Article 43(1) */}
        {isBiometric && (
          <div className="form-group">
            <h3>
              Biometric High-Risk AI System
              <span className="source-tag" title="Article 43(1)">Source</span>
            </h3>
            <p className="subtle">
              Your AI system is classified as high-risk under Annex III point 1 (biometric use case).
            </p>

            <div style={{marginTop: "20px"}}>
              <h4>Harmonized Standards / Common Specifications</h4>
              <p className="subtle">
                Have you applied harmonized standards <span className="source-tag" title="Article 40">Source</span> or common specifications <span className="source-tag" title="Article 41">Source</span>?
              </p>

              <div className="options-group radio-group">
                {[
                  ["full", "Fully applied - all requirements covered"],
                  ["partial", "Partially applied - some requirements not covered"],
                  ["none", "Not applied - standards do not exist or not used"],
                ].map(([value, label]) => (
                  <label key={value} className="radio-option">
                    <input
                      type="radio"
                      name="hs_applied"
                      checked={harmonizedStandardsApplied === value}
                      onChange={() => saveAnswer("conformity_hs_applied", value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Choice */}
            {harmonizedStandardsApplied === "full" && (
              <div style={{marginTop: "24px"}}>
                <h4>Choose Your Conformity Assessment Procedure</h4>
                <p className="subtle">
                  Since you have fully applied harmonized standards or common specifications, you may choose 
                  between the following procedures:
                </p>

                <div className="options-group radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="user_choice"
                      checked={userChoice === "internal"}
                      onChange={() => saveAnswer("conformity_user_choice", "internal")}
                    />
                    <span><strong>Internal Control (Annex VI)</strong> - Self-assessment, no notified body required</span>
                  </label>

                  <label className="radio-option">
                    <input
                      type="radio"
                      name="user_choice"
                      checked={userChoice === "notified_body"}
                      onChange={() => saveAnswer("conformity_user_choice", "notified_body")}
                    />
                    <span><strong>Notified Body (Annex VII)</strong> - Third-party assessment by notified body</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result Summary Banner */}
        {!isAnnexIB && (
          <div className="classification-result" style={{marginTop: "32px"}}>
            <div className="info-box alert-success">
              <strong>✓ Conformity Assessment Route Identified:</strong>
              <p style={{marginTop: "8px", marginBottom: "0"}}>
                {route === CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION && (
                  <>
                    Sectoral Legislation
                    <span className="source-tag" title="Article 43(3)">Source</span>
                    <br />
                    Your AI system must follow the conformity assessment procedure required under the applicable sectoral legislation.
                  </>
                )}
              {route === CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY && (
                <>
                  <strong>Route:</strong> Notified Body (Annex VII)
                  <span className="source-tag" title="Article 43(1)">Source</span>
                  <br />
                  Your AI system requires third-party assessment by a notified body.
                </>
              )}
              {route === CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL && (
                <>
                  <strong>Route:</strong> Internal Control (Annex VI)
                  <span className="source-tag" title={isNonBiometric ? "Article 43(2)" : "Article 43(1)"}>Source</span>
                  <br />
                  Your AI system can only use self-assessment based on internal control procedures. No notified body required.
                </>
              )}
              </p>
            </div>
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            View Details →
          </button>
        </div>

      </div>
    </div>
  );
}
