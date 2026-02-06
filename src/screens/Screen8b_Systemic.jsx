import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen8b_Systemic() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen7");
  }, [pushHistory]);
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
    if (hasSystemicRisk === "yes" || hasSystemicRisk === "commission_determined") {
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
        <p className="subtitle">Assess whether your GPAI model presents systemic risk.</p>
      </div>

      <div className="screen-content">
        <div className="helper-box alert-info">
          <strong>⚠️ Systemic Risk Threshold (Article 51):</strong>
          <p>
            A GPAI model has systemic risk if its cumulative computational capacity during training equals or exceeds
            10<sup>25</sup> floating-point operations (FLOPs), or is designated by the Commission based on equivalent high-impact capabilities
          </p>
        </div>

        <div className="form-section" style={{ marginTop: "24px" }}>
          <h3>Systemic Risk Assessment</h3>
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
              <span>Yes, systemic risk identified (FLOPS ≥ 10<sup>25</sup>)</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="has_systemic_risk"
                value="commission_determined"
                checked={hasSystemicRisk === "commission_determined"}
                onChange={() => saveAnswer("hasSystemicRisk", "commission_determined")}
              />
              <span>Yes, as determined by the Commission</span>
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

        {hasSystemicRisk === "yes" || hasSystemicRisk === "commission_determined" ? (
          <div className="info-box alert-warning" style={{ marginTop: "24px" }}>
            <strong>⚠️ Systemic Risk Classification:</strong>
            <p>Your GPAI model will be classified as General-purpose AI Model with Systemic Risk (Article 51). Enhanced obligations apply (Article 55).</p>
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
