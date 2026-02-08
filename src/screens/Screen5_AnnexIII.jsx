import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { ANNEX_III_USECASES, CLASSIFICATIONS } from "../data/checklist";

export default function Screen7_AnnexIII() {
  const navigate = useNavigate();
  const { answers, toggleAnswer, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen5");
  }, [pushHistory]);
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

    // A3_001: No Annex III use cases → In-scope non-high-risk → skip to GPAI
    // A3_002: Annex III use cases present → route to impact assessment (NO classification yet)
    if (hasNonNone) {
      // Do NOT set classification here - wait for impact assessment in Screen6
      navigate("/screen6");
    } else {
      // No Annex III use cases selected
      setClassificationWithPrecedence(CLASSIFICATIONS.IN_SCOPE_NON_HIGH_RISK);
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
          {ANNEX_III_USECASES.reduce((acc, option, index, array) => {
            // Add category header when category changes
            const prevOption = index > 0 ? array[index - 1] : null;
            if (option.category && option.category !== prevOption?.category) {
              acc.push(
                <div key={`header-${option.category}`} className="checkbox-group-header">
                  {option.category}
                </div>
              );
            }
            
            // Add checkbox option
            acc.push(
              <label key={option.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(option.id)}
                  onChange={() => handleToggle(option.id)}
                />
                <span>{option.label}{option.source && <span className="source-tag" title={option.source}>Source</span>}</span>
              </label>
            );
            
            return acc;
          }, [])}
        </div>

        {hasNonNone && (
          <div className="info-box alert-warning">
            <strong>⚠️ Use Case Identified:</strong>
            You selected one or more high-risk use cases. Your system requires further impact assessment to determine high-risk classification. <span className="source-tag" title="Article 6(2) and Annex III">Source</span>
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
