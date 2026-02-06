import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen8b_Systemic() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, navigateBack, shouldReevaluateRules, setShouldReevaluateRules } = useWizard();
  const hasSystemicRisk = answers.hasSystemicRisk || null;

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (!hasSystemicRisk) {
      alert("Please indicate systemic risk status.");
      return;
    }

    // Radio selection determines systemic risk classification
    if (hasSystemicRisk === "yes") {
      setClassificationWithPrecedence(CLASSIFICATIONS.GPAI_SYSTEMIC);
    } else {
      setClassificationWithPrecedence(CLASSIFICATIONS.GPAI);
    }

    navigate("/screen9");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 8: GPAI Systemic Risk Assessment</h1>
        <p className="subtitle">Assess whether your GPAI model presents systemic risk. (Rules GPAI_003-004)</p>
      </div>

      <div className="screen-content">
        <div className="helper-box alert-info">
          <strong>⚠️ Systemic Risk Threshold (Article 55):</strong>
          <p>
            A GPAI model has systemic risk if its cumulative computational capacity during training equals or exceeds
            <strong> 10<sup>25</sup> floating-point operations (FLOPs)</strong>, or meets other criteria like:
          </p>
          <ul>
            <li>Affecting democratic processes or fundamental rights</li>
            <li>Potential for critical infrastructure disruption</li>
            <li>Capability for significant cybersecurity impacts</li>
          </ul>
        </div>

        <div className="form-section" style={{ marginTop: "24px" }}>
          <h3>Systemic Risk Assessment (Rule GPAI_004)</h3>
          <p style={{ fontSize: "0.9em", color: "#666", marginBottom: "16px" }}>
            Based on FLOPS and other risk indicators, does your model have systemic risk?
          </p>
          <div className="options-group radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="has_systemic_risk"
                value="yes"
                checked={hasSystemicRisk === "yes"}
                onChange={() => saveAnswer("hasSystemicRisk", "yes")}
              />
              <span>Yes, systemic risk identified (FLOPS ≥ 10<sup>25</sup> or other criteria met)</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="has_systemic_risk"
                value="no"
                checked={hasSystemicRisk === "no"}
                onChange={() => saveAnswer("hasSystemicRisk", "no")}
              />
              <span>No, no systemic risk (FLOPS &lt; 10<sup>25</sup> and no other risk indicators)</span>
            </label>
          </div>
        </div>

        {hasSystemicRisk === "yes" ? (
          <div className="info-box alert-warning" style={{ marginTop: "24px" }}>
            <strong>⚠️ Systemic Risk Classification:</strong>
            <p>Your GPAI model will be classified as <strong>GPAI_SYSTEMIC</strong>. Enhanced obligations (K1-K13) apply, including red-teaming, adversarial testing, and systemic risk mitigation.</p>
          </div>
        ) : (
          hasSystemicRisk === "no" && (
            <div className="info-box alert-success" style={{ marginTop: "24px" }}>
              <strong>✓ Standard GPAI Classification:</strong>
              <p>Your model is classified as standard GPAI without systemic risk. Standard obligations (J1-J16) apply.</p>
            </div>
          )
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNext} 
            disabled={!hasSystemicRisk}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
