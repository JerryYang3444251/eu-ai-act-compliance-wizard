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
    toggleAnswer,
    setConformityRoute,
    classification,
    navigateBack,
    shouldReevaluateRules,
    setShouldReevaluateRules,
    pushHistory,
  } = useWizard();

  useEffect(() => {
    pushHistory("/screen13a");
  }, [pushHistory]);
  // RULE ENGINE: Conformity Assessment ONLY for Providers with High-Risk
  // -------------------------------------------------------------------------
  const isProvider = roles.includes("Provider");
  
  const requiresCA =
    isProvider &&
    classification &&
    [
      CLASSIFICATIONS.HIGH_RISK_IA,
      CLASSIFICATIONS.HIGH_RISK_IB,
      CLASSIFICATIONS.HIGH_RISK_III,
    ].includes(classification);

  // If CA does not apply → skip directly to Screen14
  useEffect(() => {
    if (!requiresCA) {
      navigate("/screen14");
    }
  }, [requiresCA, navigate]);

  if (!requiresCA) return null;

  // -----------------------------------------------------------------------
  // Retrieve answers for each section
  // -----------------------------------------------------------------------
  const sectionA = answers.conformity_section_a || [];
  const sectionB = answers.conformity_section_b || [];
  const sectionC = answers.conformity_section_c || [];
  const sectionD = answers.conformity_section_d || [];
  const sectionE = answers.conformity_section_e || [];

  // -----------------------------------------------------------------------
  // Mutual Exclusivity Handler for Each Section
  // When "none" is selected, deselect all others.
  // When any option is selected, deselect "none".
  // -----------------------------------------------------------------------
  const handleToggleSection = (field, optionId) => {
    const current = answers[field] || [];
    
    if (optionId === "none") {
      // If "none" is clicked
      if (current.includes("none")) {
        // Deselect "none"
        saveAnswer(field, current.filter(item => item !== "none"));
      } else {
        // Select only "none"
        saveAnswer(field, ["none"]);
      }
    } else {
      // If any other option is clicked
      if (current.includes("none")) {
        // Clear "none" first, then add the new option
        saveAnswer(field, [optionId]);
      } else {
        // Toggle the option normally (add or remove)
        if (current.includes(optionId)) {
          saveAnswer(field, current.filter(item => item !== optionId));
        } else {
          saveAnswer(field, [...current, optionId]);
        }
      }
    }
  };

  // ---------------------------------------------------------------------
  // MODULE 10 — CA ROUTING (CA_001 → CA_004)
  // ---------------------------------------------------------------------
  const determineRoute = () => {
    const A_sectoral = sectionA.length > 0 && !sectionA.includes("none");
    const B_thirdparty = sectionB.length > 0 && !sectionB.includes("none");

    const C_HS_full_coverage = sectionC.includes("full_harmonized_standards");

    const D_CS_available = sectionD.includes("common_specifications_exist");
    const D_CS_commit = sectionD.includes("commit_full_cs");

    const E_safety_indicators =
      sectionE.length > 0 && !sectionE.includes("none");

    // -------------------------------------------
    // CA_001 — Sectoral Legislation (Highest Priority)
    // -------------------------------------------
    if (A_sectoral && B_thirdparty) {
      return CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION;
    }

    // -------------------------------------------
    // CA_002 — Common Specifications Route
    // -------------------------------------------
    if (D_CS_available && D_CS_commit) {
      return CONFORMITY_ASSESSMENT_ROUTES.COMMON_SPECIFICATIONS;
    }

    // -------------------------------------------
    // CA_003 — Internal Control Route
    // Conditions:
    //  HS fully covers requirements AND
    //  NOT sectoral AND
    //  NOT third-party required AND
    //  NO common specifications AND
    //  NO safety/complexity indicators
    // -------------------------------------------
    if (
      C_HS_full_coverage &&
      !A_sectoral &&
      !B_thirdparty &&
      !D_CS_available &&
      !E_safety_indicators
    ) {
      return CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL;
    }

    // -------------------------------------------
    // CA_004 — Notified Body (Fallback)
    // If HS NOT full OR safety indicators present
    // -------------------------------------------
    if (!C_HS_full_coverage || E_safety_indicators) {
      return CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY;
    }

    // -------------------------------------------
    // CA_000 — Ultimate fallback
    // -------------------------------------------
    return CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY;
  };

  const route = determineRoute();

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
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
        <p className="subtitle">Determine your conformity assessment route based on sectoral law, standards, and risk factors.</p>
      </div>

      <div className="screen-content">

        {/* SECTION A */}
        <div className="form-group">
          <h3>Section A — EU Product Safety Legislation</h3>
          {[
            ["mdr", "Medical Devices Regulation (MDR)"],
            ["ivdr", "In Vitro Diagnostics Regulation (IVDR)"],
            ["machinery", "Machinery Regulation"],
            ["lifts", "Lifts Regulation"],
            ["toys", "Toy Safety Directive"],
            ["atex", "ATEX Directive"],
            ["pressure", "Pressure Equipment Directive"],
            ["radio", "Radio Equipment Directive"],
            ["ppe", "PPE Regulation"],
            ["gas", "Gas Appliances Regulation"],
            ["cableways", "Cableways Regulation"],
            ["recreational", "Recreational Craft Directive"],
            ["none", "None of the above"],
          ].map(([id, label]) => (
            <label key={id} className="checkbox-option">
              <input
                type="checkbox"
                checked={sectionA.includes(id)}
                onChange={() => handleToggleSection("conformity_section_a", id)}
              />
              <span>{label}</span>
            </label>
          ))}

          {/* SECTION B */}
          <h3 style={{ marginTop: 16 }}>Section B — Sectoral Law Third‑Party Assessment</h3>
          {[
            ["requires_notified_body", "Sectoral law requires a Notified Body"],
            ["is_safety_component", "AI component is considered a safety component"],
            ["notified_body_mandated", "NB must review design/manufacturing processes"],
            ["certification_not_via_self", "Self‑assessment is not permitted"],
            ["none", "None of the above"],
          ].map(([id, label]) => (
            <label key={id} className="checkbox-option">
              <input
                type="checkbox"
                checked={sectionB.includes(id)}
                onChange={() => handleToggleSection("conformity_section_b", id)}
              />
              <span>{label}</span>
            </label>
          ))}

          {/* SECTION C */}
          <h3 style={{ marginTop: 16 }}>Section C — Harmonized Standards</h3>
          {[
            ["full_harmonized_standards", "Fully implements applicable Harmonized Standards"],
            ["essential_covered_by_hs", "All essential requirements covered by Harmonized Standards"],
            ["hs_documented", "Documentation proves full HS compliance"],
            ["hs_alone", "HS alone can demonstrate conformity"],
            ["none", "None of the above"],
          ].map(([id, label]) => (
            <label key={id} className="checkbox-option">
              <input
                type="checkbox"
                checked={sectionC.includes(id)}
                onChange={() => handleToggleSection("conformity_section_c", id)}
              />
              <span>{label}</span>
            </label>
          ))}

          {/* SECTION D */}
          <h3 style={{ marginTop: 16 }}>Section D — Common Specifications</h3>
          {[
            ["common_specifications_exist", "Common Specifications exist for this system"],
            ["commit_full_cs", "Organisation commits to full Common Specifications compliance"],
            ["cs_cover_requirements", "Common Specifications cover all requirements in Articles 9–15"],
            ["none", "None of the above"],
          ].map(([id, label]) => (
            <label key={id} className="checkbox-option">
              <input
                type="checkbox"
                checked={sectionD.includes(id)}
                onChange={() => handleToggleSection("conformity_section_d", id)}
              />
              <span>{label}</span>
            </label>
          ))}

          {/* SECTION E */}
          <h3 style={{ marginTop: 16 }}>Section E — Nature & Risk Profile</h3>
          {[
            ["affects_safety", "Intended function directly affects safety"],
            ["could_lead_significant_harm", "Malfunction could lead to significant harm"],
            ["complex_opaque_novel", "Complex, opaque, or novel architectures"],
            ["not_fully_covered_by_hs", "Not fully covered by Harmonized Standards"],
            ["requires_third_party_validation", "Requires third‑party validation"],
            ["none", "None of the above"],
          ].map(([id, label]) => (
            <label key={id} className="checkbox-option">
              <input
                type="checkbox"
                checked={sectionE.includes(id)}
                onChange={() => handleToggleSection("conformity_section_e", id)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="route-summary">
          <p><strong>Identified Route:</strong></p>
          <p className="route-name">
            {route === CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION && "Sectoral Legislation"}
            {route === CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY && "Notified Body"}
            {route === CONFORMITY_ASSESSMENT_ROUTES.COMMON_SPECIFICATIONS && "Common Specifications"}
            {route === CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL && "Internal Control"}
          </p>
        </div>

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
