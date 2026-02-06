import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { ANNEX_III_USECASES, CLASSIFICATIONS } from "../data/checklist";

export default function Screen7_AnnexIII() {
  const navigate = useNavigate();
  const { answers, toggleAnswer, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules } = useWizard();
  const selectedItems = answers.annexIIIUsecases || [];

  // None-exclusive toggle: if "none" selected, deselect all others; if any other selected, deselect "none"
  const handleToggle = (id) => {
    if (id === "none") {
      if (selectedItems.includes("none")) {
        saveAnswer("annexIIIUsecases", []);
      } else {
        saveAnswer("annexIIIUsecases", ["none"]);
      }
    } else {
      if (selectedItems.includes("none")) {
        saveAnswer("annexIIIUsecases", [id]);
      } else {
        const updated = selectedItems.includes(id)
          ? selectedItems.filter(x => x !== id)
          : [...selectedItems, id];
        saveAnswer("annexIIIUsecases", updated);
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
      setClassificationWithPrecedence(CLASSIFICATIONS.HIGH_RISK_III);
      navigate("/screen6");
    } else {
      navigate("/screen7");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 5: Annex III Use Cases</h1>
        <p className="subtitle">Does your AI system fall within any of these high-risk use cases?</p>
      </div>

      <div className="screen-content">
        <div className="options-group checkbox-group">
          {ANNEX_III_USECASES.map((option) => (
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
          <div className="info-box alert-warning">
            <strong>⚠️ Classification Update:</strong>
            <p>Your AI system has been classified as HIGH_RISK_III. Further risk assessment required.</p>
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
