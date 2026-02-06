import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { HIGH_RISK_SECTORS_B, CLASSIFICATIONS } from "../data/checklist";

export default function Screen4() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules } = useWizard();
  const sectors = answers.highRiskSectorsB || [];

  const handleToggle = (id) => {
    if (id === "none") {
      if (sectors.includes("none")) {
        saveAnswer("highRiskSectorsB", []);
      } else {
        saveAnswer("highRiskSectorsB", ["none"]);
      }
    } else {
      if (sectors.includes("none")) {
        saveAnswer("highRiskSectorsB", [id]);
      } else {
        const updated = sectors.includes(id)
          ? sectors.filter(s => s !== id)
          : [...sectors, id];
        saveAnswer("highRiskSectorsB", updated);
      }
    }
  };

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    const hasHighRisk = sectors.length > 0 && !sectors.includes("none");
    if (hasHighRisk) {
      setClassificationWithPrecedence(CLASSIFICATIONS.HIGH_RISK_IB);
    }
    // Continue sequentially to AnnexIII (Screen5)
    navigate("/screen5");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 4: Annex I Section B High-Risk Check</h1>
        <p className="subtitle">Does your AI system relate to any of the following regulated product sectors?</p>
      </div>

      <div className="screen-content">
        <div className="options-group checkbox-group">
          {HIGH_RISK_SECTORS_B.map((option) => (
            <label key={option.id} className="checkbox-option">
              <input
                type="checkbox"
                checked={sectors.includes(option.id)}
                onChange={() => handleToggle(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {sectors.length > 0 && !sectors.includes("none") && (
          <div className="info-box alert-warning">
            <strong>🚨 High-Risk Classification:</strong>
            <p>Your AI system is classified as High-Risk under Annex I Section B. You will skip to detailed obligations.</p>
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={sectors.length === 0}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
