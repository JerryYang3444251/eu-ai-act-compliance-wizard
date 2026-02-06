import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { PROHIBITED_PRACTICES, CLASSIFICATIONS } from "../data/checklist";

export default function Screen10_Prohibited() {
  const navigate = useNavigate();
  const { answers, toggleAnswer, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen8");
  }, [pushHistory]);
  const selectedItems = answers.prohibitedPractices || [];

  // None-exclusive toggle: if "none" selected, deselect all others; if any other selected, deselect "none"
  const handleToggle = (id) => {
    if (id === "none") {
      if (selectedItems.includes("none")) {
        saveAnswer("prohibitedPractices", []);
      } else {
        saveAnswer("prohibitedPractices", ["none"]);
      }
    } else {
      if (selectedItems.includes("none")) {
        saveAnswer("prohibitedPractices", [id]);
      } else {
        const updated = selectedItems.includes(id)
          ? selectedItems.filter(x => x !== id)
          : [...selectedItems, id];
        saveAnswer("prohibitedPractices", updated);
      }
    }
  };

  const hasProhibited = selectedItems.some(s => s !== "none");

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (!selectedItems.length) return;

    if (hasProhibited) {
      setClassificationWithPrecedence(CLASSIFICATIONS.PROHIBITED);
      // Rule PROHIB_001: Prohibited classification routes directly to SCREEN_FINAL (checklist output)
      navigate("/screen12");
    } else {
      // No prohibited practices - proceed to Screen 10 (Transparency)
      navigate("/screen10");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 9: Prohibited Practices</h1>
        <p className="subtitle">Does your AI system implement any of these prohibited practices?</p>
      </div>

      <div className="screen-content">
        <div className="options-group checkbox-group">
          {PROHIBITED_PRACTICES.map((option) => (
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

        {hasProhibited && (
          <div className="info-box alert-danger">
            <strong>❌ Prohibited:</strong>
            <p>Your AI system implements prohibited practices under the EU AI Act. These must be removed immediately and the system cannot be deployed.</p>
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
