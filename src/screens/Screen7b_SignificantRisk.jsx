import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen7b_SignificantRisk() {
  const navigate = useNavigate();
  const { answers, saveAnswer, toggleAnswer, setClassificationWithPrecedence, navigateBack, shouldReevaluateRules, setShouldReevaluateRules } = useWizard();

  const impactChecks = answers.impact_checks || [];

  // -------------------------------------------------------------------
  // RULE ENGINE MATCHING OPTIONS
  // These are EXACTLY the identifiers the rule engine expects.
  // -------------------------------------------------------------------
  const SIGNIFICANT_RISK_OPTIONS = [
    { id: "decision_basis", label: "The system's output is used as a basis for a decision about a person" },
    { id: "decision_constraining", label: "The system shapes, constrains, or determines a final decision" },
    { id: "unverifiable_output", label: "Users cannot reasonably verify the output" },
    { id: "access_entitlements", label: "Affects eligibility or access to services, benefits, rights, or opportunities" },
    { id: "profiling_effects", label: "Profiles, scores, classifies, or predicts individuals in ways that affect rights" },
    { id: "harm_risk", label: "Errors could cause harm to health, safety, property, or rights" },
    { id: "disadvantage_risk", label: "Incorrect outputs could materially disadvantage a person" },
    { id: "opacity_limiting_oversight", label: "System is complex/opaque in a way that limits human oversight" },
    { id: "automation_bias_risk", label: "Human oversight cannot counter automation bias" },
    { id: "law_enforcement_effect", label: "Affects decisions in policing or law enforcement" },
    { id: "migration_border_effect", label: "Affects decisions on migration, asylum, visas, or border control" },
  ];

  const NONE_OPTION = "none_of_the_above";

  const handleToggle = (id) => {
    // If selecting NONE → clear everything else
    if (id === NONE_OPTION) {
      if (impactChecks.includes(NONE_OPTION)) {
        saveAnswer("impact_checks", []);
      } else {
        saveAnswer("impact_checks", [NONE_OPTION]);
      }
      return;
    }

    // If selecting ANY risk indicator → deselect NONE
    const updated = impactChecks.includes(id)
      ? impactChecks.filter((v) => v !== id && v !== NONE_OPTION)
      : [...impactChecks.filter((v) => v !== NONE_OPTION), id];

    saveAnswer("impact_checks", updated);
  };

  const hasSignificant = impactChecks.some((v) => v !== NONE_OPTION);
  const hasNone = impactChecks.length === 1 && impactChecks[0] === NONE_OPTION;

  const hasConflict = hasSignificant && hasNone;
  const hasSelection = impactChecks.length > 0;

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (!hasSelection) {
      alert("Please select one or more options.");
      return;
    }

    if (hasConflict) {
      alert("You cannot select both 'none of the above' and other indicators.");
      return;
    }

    // -------------------------------------------------------------------
    // RULE ENGINE CLASSIFICATION
    // EXACT MATCH with:
    //  A3_IMPACT_001 → High-risk Annex III
    //  A3_IMPACT_002 → Annex III Non-Significant
    // -------------------------------------------------------------------
    if (hasSignificant) {
      setClassificationWithPrecedence(CLASSIFICATIONS.HIGH_RISK_III);
    } else if (hasNone) {
      setClassificationWithPrecedence(CLASSIFICATIONS.ANNEX_III_NON_SIGNIFICANT);
    }

    // Route to SCREEN 7 (GPAI CHECK)
    navigate("/screen7");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 6: Significant Risk Assessment</h1>
        <p className="subtitle">
          Select applicable criteria. Your selection determines whether your Annex III system
          is HIGH-RISK or NON-SIGNIFICANT.
        </p>
      </div>

      <div className="screen-content">
        <div className="info-box alert-info">
          <p>
            If you select any of the criteria below, your system is classified as HIGH-RISK Annex III.
            If none apply, select “None of the above”.
          </p>
        </div>

        <h3>Indicators of Significant Risk</h3>
        <p className="section-help">Select all that apply</p>

        <div className="options-group checkbox-group">
          {SIGNIFICANT_RISK_OPTIONS.map((opt) => (
            <label key={opt.id} className="checkbox-option">
              <input
                type="checkbox"
                checked={impactChecks.includes(opt.id)}
                onChange={() => handleToggle(opt.id)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        <h3 style={{ marginTop: "32px" }}>None of the above</h3>
        <label className="checkbox-option">
          <input
            type="checkbox"
            checked={hasNone}
            onChange={() => handleToggle(NONE_OPTION)}
          />
          <span>No significant-risk indicators apply</span>
        </label>

        {hasConflict && (
          <div className="info-box alert-danger" style={{ marginTop: "20px" }}>
            <strong>⚠️ Conflict detected:</strong>
            <p>
              You selected “None of the above” AND other indicators.
              Please correct your selection.
            </p>
          </div>
        )}

        {hasSignificant && !hasConflict && (
          <div className="info-box alert-warning" style={{ marginTop: "20px" }}>
            <strong>⚠️ High-Risk Annex III:</strong>
            <p>You selected at least one risk indicator. Full high-risk requirements will apply.</p>
          </div>
        )}

        {hasNone && !hasConflict && (
          <div className="info-box alert-success" style={{ marginTop: "20px" }}>
            <strong>✓ Annex III Non-Significant:</strong>
            <p>No significant risk identified. Reduced obligations will apply.</p>
          </div>
        )}

        <div className="screen-navigation" style={{ marginTop: "32px" }}>
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!hasSelection || hasConflict}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
