import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { MODIFICATIONS } from "../data/checklist";

export default function Screen2() {
  const navigate = useNavigate();
  const { answers, toggleAnswer, saveAnswer, setRole, role, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen2");
  }, [pushHistory]);
  const modifications = answers.modifications || [];

  const handleToggle = (id) => {
    if (id === "none") {
      // If none is selected, uncheck all others
      if (modifications.includes("none")) {
        toggleAnswer("modifications", "none");
      } else {
        // Uncheck all, then add none
        saveAnswer("modifications", ["none"]);
      }
    } else {
      // If any real modification is selected, remove none if present
      if (modifications.includes("none")) {
        saveAnswer("modifications", [id]);
      } else {
        toggleAnswer("modifications", id);
      }
    }
  };

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    const hasModification = modifications.some(m => m !== "none");
    
    if (hasModification) {
      setRole("provider");
    }
    
    if (role === "product_manufacturer") {
      navigate("/screen3");
    } else {
      navigate("/screen4");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 2: System Modification Check</h1>
        <p className="subtitle">Did you or a downstream party modify this AI system?</p>
      </div>

      <div className="screen-content">
        <div className="options-group checkbox-group">
          {MODIFICATIONS.map((option) => (
            <label key={option.id} className="checkbox-option">
              <input
                type="checkbox"
                checked={modifications.includes(option.id)}
                onChange={() => handleToggle(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {modifications.some(m => m !== "none") && (
          <div className="info-box alert-warning">
            <strong>⚠️ Important:</strong>
            <p>You are legally considered a Provider under the EU AI Act.</p>
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={modifications.length === 0}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
