import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { PRODUCT_INTEGRATION, CLASSIFICATIONS } from "../data/checklist";

export default function Screen3() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen3");
  }, [pushHistory]);
  const integration = answers.productIntegration;

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (integration === "neither") {
      // Neither option ends the pathway - manufacturer out-of-scope
      setClassificationWithPrecedence(CLASSIFICATIONS.OUT_OF_SCOPE);
      navigate("/screen12");
    } else {
      navigate("/screen4");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 3: Product Manufacturer Path</h1>
        <p className="subtitle">How does your AI system integrate with your product?</p>
      </div>

      <div className="screen-content">
        <div className="options-group radio-group">
          {PRODUCT_INTEGRATION.map((option) => (
            <label key={option.id} className="radio-option">
              <input type="radio" name="product_integration" value={option.id} checked={integration === option.id} onChange={(e) => saveAnswer("productIntegration", e.target.value)} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {integration === "neither" && <div className="info-box alert-info"><strong>ℹ️ Notice:</strong><p>Your system is out of AI Act-specific scope.</p></div>}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>← Back</button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!integration}>Next →</button>
        </div>
      </div>
    </div>
  );
}
