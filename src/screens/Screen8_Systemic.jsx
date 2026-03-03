import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen8b_Systemic() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, setCommissionDesignation } = useWizard();

  useEffect(() => {
    pushHistory("/screen8");
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

    // Set commission designation flag if applicable
    if (hasSystemicRisk === "commission_determined") {
      setCommissionDesignation(true);
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
          <strong>Systemic Risk Threshold:</strong>
          <p>
            A GPAI model has systemic risk if its cumulative computational capacity during training equals or exceeds
            10<sup>25</sup> floating-point operations (FLOPs), or is designated by the Commission based on equivalent high-impact capabilities. <span className="source-tag" title="Article 51">Source</span>
          </p>
        </div>

        <div className="form-section" style={{ marginTop: "24px" }}>
          <h3>Systemic Risk Assessment</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-light)", marginBottom: "16px" }}>
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
            You indicated systemic risk criteria are met. Your model is classified as a General-Purpose AI Model with Systemic Risk. Enhanced obligations apply <strong>to you in your capacity as the provider of this GPAI model</strong>. <span className="source-tag" title="Articles 51 and 55">Source</span>
          </div>
        ) : (
          hasSystemicRisk === "no" && (
              <div className="info-box alert-success" style={{ marginTop: "24px" }}>
                <strong>✓ Standard GPAI Classification:</strong>
                You indicated systemic risk criteria are not met. Your model is classified as standard GPAI without systemic risk. Standard GPAI obligations apply <strong>only if you are the provider placing this GPAI model on the market</strong>. <span className="source-tag" title="Articles 52-53">Source</span>
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
