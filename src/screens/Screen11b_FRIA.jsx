import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen11b_FRIA() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setIsFria, navigateBack, classification, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen11b");
  }, [pushHistory]);
  const isPublicBody = answers.is_public_body;

  // Determine if FRIA should be required based on public body status and high-risk classification
  const isHighRisk = classification && [
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  const friaRequired = isPublicBody === true && isHighRisk;

  // Debug logging
  console.log("Screen11b_FRIA - Classification check:", {
    classification,
    isHighRisk,
    isPublicBody,
    friaRequired,
    HIGH_RISK_IB: CLASSIFICATIONS.HIGH_RISK_IB,
    HIGH_RISK_IA: CLASSIFICATIONS.HIGH_RISK_IA,
    HIGH_RISK_III: CLASSIFICATIONS.HIGH_RISK_III,
  });

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (isPublicBody === null || isPublicBody === undefined) {
      alert("Please indicate whether you are a public body/authority.");
      return;
    }

    // Set FRIA status based on public body + high-risk determination
    setIsFria(friaRequired);
    navigate("/screen12");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 11: Fundamental Rights Impact Assessment (FRIA)</h1>
        <p className="subtitle">Determine if FRIA is required for your AI system (Article 27a)</p>
      </div>

      <div className="screen-content">

        {/* ===== PUBLIC BODY / AUTHORITY QUESTION ===== */}
        <div style={{ marginTop: "0", paddingTop: "0", borderTop: "none" }}>
          <h3 style={{ marginBottom: "16px" }}>Are you a public body or authority?</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.95em", color: "#666" }}>
            This affects whether Fundamental Rights Impact Assessment (FRIA) is required.
            Select "Yes" if you work for a government agency, public administration, or you are a private actor performing tasks “in the public interest” on behalf of a public authority (outsourced services).
          </p>
          
          <div className="options-group radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="is_public_body"
                value="yes"
                checked={answers.is_public_body === true}
                onChange={() => saveAnswer("is_public_body", true)}
              />
              <span>Yes, we are, or serve for, a public body/authority</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="is_public_body"
                value="no"
                checked={answers.is_public_body === false}
                onChange={() => saveAnswer("is_public_body", false)}
              />
              <span>No, we fall outside of the above scope</span>
            </label>
          </div>
        </div>

        {/* FRIA REQUIREMENT RESULT - ONLY SHOW WHEN PUBLIC BODY SELECTED */}
        {isPublicBody === true && (
          <div style={{ marginTop: "24px" }}>
            {friaRequired ? (
              <div className="info-box alert-warning">
                <strong>⚠️ FRIA Required:</strong>
                <p>
                  You must conduct and document a comprehensive Fundamental Rights Impact Assessment before deploying 
                  your system. As a public body deploying a high-risk AI system, FRIA is mandatory per Article 27a.
                </p>
              </div>
            ) : (
              <div className="info-box alert-info">
                <strong>ℹ️ Public Body Selected:</strong>
                <p>
                  You are a public body, but FRIA is only required for high-risk systems. Your system classification does not trigger FRIA obligations.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={isPublicBody === null || isPublicBody === undefined}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
