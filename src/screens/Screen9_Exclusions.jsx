import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { EXCLUSIONS, CLASSIFICATIONS } from "../data/checklist";

export default function Screen9_Exclusions() {
  const navigate = useNavigate();
  const { answers, toggleAnswer, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen9");
  }, [pushHistory]);
  const selectedItems = answers.exclusions || [];

  // None-exclusive toggle: if "none" selected, deselect all others; if any other selected, deselect "none"
  const handleToggle = (id) => {
    if (id === "none") {
      if (selectedItems.includes("none")) {
        saveAnswer("exclusions", []);
      } else {
        saveAnswer("exclusions", ["none"]);
      }
    } else {
      if (selectedItems.includes("none")) {
        saveAnswer("exclusions", [id]);
      } else {
        const updated = selectedItems.includes(id)
          ? selectedItems.filter(x => x !== id)
          : [...selectedItems, id];
        saveAnswer("exclusions", updated);
      }
    }
  };

  const hasNonNone = selectedItems.some(s => s !== "none");

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (!selectedItems.length) return;

    if (hasNonNone) {
      setClassificationWithPrecedence(CLASSIFICATIONS.EXCLUDED);
      // Skip directly to Screen 12 (FinalClassification) when exclusion detected
      navigate("/screen12");
    } else {
      navigate("/screen10");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 9: EU AI Act Exclusions</h1>
        <p className="subtitle">Does your AI system fall under any of these exclusions from the EU AI Act?</p>
      </div>

      <div className="screen-content">
        <div className="options-group checkbox-group">
          {EXCLUSIONS.map((option) => (
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

        {hasNonNone && (
          <div className="info-box alert-success">
            <strong>✓ Exclusion Applied:</strong>
            <p>Your AI system is excluded from EU AI Act scope. You will proceed to final classification.</p>
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
