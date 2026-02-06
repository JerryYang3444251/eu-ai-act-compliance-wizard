import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { TRANSPARENCY_TRIGGERS, CLASSIFICATIONS } from "../data/checklist";

export default function Screen11_Transparency() {
  const navigate = useNavigate();
  const { answers, saveAnswer, classification, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen9");
  }, [pushHistory]);
  const selectedItems = answers.transparencyTriggers || [];
  const is_public_body = answers.is_public_body; // Rule OBL_009 gating: is_public_body + high-risk → FRIA

  // None-exclusive toggle: if "none" selected, deselect all others; if any other selected, deselect "none"
  const handleToggle = (id) => {
    if (id === "none") {
      if (selectedItems.includes("none")) {
        saveAnswer("transparencyTriggers", []);
      } else {
        saveAnswer("transparencyTriggers", ["none"]);
      }
    } else {
      if (selectedItems.includes("none")) {
        saveAnswer("transparencyTriggers", [id]);
      } else {
        const updated = selectedItems.includes(id)
          ? selectedItems.filter(x => x !== id)
          : [...selectedItems, id];
        saveAnswer("transparencyTriggers", updated);
      }
    }
  };

  const hasTransparencyObligation = selectedItems.some(s => s !== "none");

  // =====================================================================
  // PUBLIC BODY / AUTHORITY DETERMINATION
  // =====================================================================

  // Determine if FRIA assessment should be offered
  // Rule OBL_009: FRIA only applies if is_public_body === true AND classification is high-risk
  const isHighRisk = classification && [
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  const shouldOfferFRIA = is_public_body === true && isHighRisk;

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    // Validate that user answered transparency questions
    if (!selectedItems.length) {
      alert("Please select transparency obligations.");
      return;
    }

    // Check if we need to collect FRIA information
    // Always route to FRIA screen to collect public_body status and deployment_sector info
    // The FRIA screen will determine if FRIA is actually required based on rule engine logic
    navigate("/screen11");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 10: Transparency Obligations</h1>
        <p className="subtitle">Select all that apply to your AI system:</p>
      </div>

      <div className="screen-content">
        <div className="options-group checkbox-group">
          {TRANSPARENCY_TRIGGERS.map((option) => (
            <label key={option.id} className="checkbox-option">
              <input
                type="checkbox"
                checked={selectedItems.includes(option.id)}
                onChange={() => handleToggle(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {hasTransparencyObligation && (
          <div className="info-box alert-info">
            <strong>ℹ️ Transparency Required:</strong>
            <p>Your AI system triggers transparency obligations. Users must be informed about AI involvement and system capabilities.</p>
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!selectedItems.length}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
