import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen8_GPAI() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen6");
  }, [pushHistory]);

  const isGPAI = answers.isGPAI || null;

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (isGPAI === "yes") {
      // GPAI_002: is_gpai == true → SCREEN_8b (systemic risk check)
      console.log("GPAI_002: User selected YES - is GPAI");
      navigate("/screen8");
    } else if (isGPAI === "no") {
      // GPAI_001: is_gpai == false → SCREEN_9 (Prohibited)
      console.log("GPAI_001: User selected NO - NOT GPAI");
      navigate("/screen9");
    }
  };

  const getDescription = () => {
    return "A General Purpose AI (GPAI) model is trained on broad data, performs broad tasks, and is intentionally designed for widespread use in multiple downstream applications.";
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 7: General Purpose AI (GPAI)</h1>
        <p className="subtitle">Is your AI system a General Purpose AI model?</p>
      </div>

      <div className="screen-content">
        <div className="helper-box alert-info">
          <strong>ℹ️ Definition:</strong>
          <p>{getDescription()}</p>
        </div>

        <div className="options-group radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="is_gpai"
              value="yes"
              checked={isGPAI === "yes"}
              onChange={() => saveAnswer("isGPAI", "yes")}
            />
            <span>Yes, this is a GPAI model</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="is_gpai"
              value="no"
              checked={isGPAI === "no"}
              onChange={() => saveAnswer("isGPAI", "no")}
            />
            <span>No, this is not a GPAI model</span>
          </label>
        </div>

        {isGPAI === "yes" && (
          <div className="info-box alert-info">
            <strong>ℹ️ Next Step:</strong>
            <p>We will now assess whether your GPAI model presents systemic risks.</p>
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={isGPAI === null}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
