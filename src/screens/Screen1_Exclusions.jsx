import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { EXCLUSIONS, CLASSIFICATIONS } from "../data/checklist";

export default function Screen1_Exclusions() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, navigateBack, shouldReevaluateRules, setShouldReevaluateRules } = useWizard();
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
      // Skip directly to classification when exclusion detected
      navigate("/screen12");
    } else {
      // No exclusions found, proceed to role determination
      navigate("/screen2");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 1: EU AI Act Exclusions</h1>
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
            <p>Your AI system is excluded from EU AI Act scope.</p>
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
