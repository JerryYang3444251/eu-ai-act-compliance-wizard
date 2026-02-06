import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen6() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules } = useWizard();

  const euLaws = answers.euLaws || [];
  const conformityRequirements = answers.conformityRequirements || [];
  const intendedFunctions = answers.intendedFunctions || [];

  const EU_LAWS = [
    "Machinery Regulation",
    "Medical Devices Regulation (MDR)",
    "In Vitro Diagnostics Regulation (IVDR)",
    "Lifts Regulation",
    "Toy Safety Directive",
    "Radio Equipment Directive",
    "ATEX Directive",
    "Pressure Equipment Directive",
    "PPE Regulation",
    "Gas Appliances Regulation",
    "Recreational Craft / Watercraft",
    "Cableways",
    "None / Unsure"
  ];

  const CONFORMITY_REQUIREMENTS = [
    "The product category requires assessment by a Notified Body",
    "The product includes a safety component that must be certified separately",
    "The AI system directly fulfils a safety function",
    "The failure or malfunction of the AI system could endanger health, safety, or property",
    "The AI component changes the risk profile of the product",
    "Harmonised standards alone are NOT sufficient to demonstrate conformity",
    "The law mandates a third-party involvement",
    "None of the above"
  ];

  const INTENDED_FUNCTIONS = [
    "Influences safety-related decisions",
    "Operates autonomously in safety-relevant contexts",
    "Makes decisions that reduce human control",
    "Detects or responds to hazards",
    "Is relied upon for system safety functions",
    "None of the above"
  ];

  const toggleItem = (field, value) => {
    const current = answers[field] || [];
    const noneValue = field === "euLaws" ? "None / Unsure" : "None of the above";
    
    if (value === noneValue) {
      // If none/unsure is clicked
      if (current.includes(noneValue)) {
        // Uncheck it
        saveAnswer(field, current.filter(item => item !== noneValue));
      } else {
        // Check it and clear all others
        saveAnswer(field, [noneValue]);
      }
    } else {
      // If any other option is clicked
      if (current.includes(noneValue)) {
        // Clear none/unsure first
        saveAnswer(field, [value]);
      } else {
        // Toggle normally
        const updated = current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value];
        saveAnswer(field, updated);
      }
    }
  };

  const determineAnswer = () => {
    const hasRequirements = conformityRequirements.length > 0 && !conformityRequirements.every(r => r === "None of the above");
    const hasFunctions = intendedFunctions.length > 0 && !intendedFunctions.every(f => f === "None of the above");
    const hasNoneLaw = euLaws.includes("None / Unsure");

    if (hasRequirements || hasFunctions) {
      return "yes";
    } else if (hasNoneLaw && (conformityRequirements.includes("None of the above") || intendedFunctions.includes("None of the above"))) {
      return "unsure";
    } else {
      return "no";
    }
  };

  const answer = determineAnswer();
  const allSectionsComplete = euLaws.length > 0 && conformityRequirements.length > 0 && intendedFunctions.length > 0;

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (!allSectionsComplete) return;

    if (answer === "yes") {
      setClassificationWithPrecedence(CLASSIFICATIONS.HIGH_RISK_IA);
      navigate("/screen7");
    } else if (answer === "no") {
      navigate("/screen7");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 6: Conformity Assessment Type Requirement</h1>
        <p className="subtitle">Does your product category require a third-party conformity assessment?</p>
      </div>

      <div className="screen-content">
        <h3>Section A: EU Law Identification</h3>
        <p className="section-help">Select all product laws applicable to your product</p>
        <div className="options-group checkbox-group">
          {EU_LAWS.map((law) => (
            <label key={law} className="checkbox-option">
              <input
                type="checkbox"
                checked={euLaws.includes(law)}
                onChange={() => toggleItem("euLaws", law)}
              />
              <span>{law}</span>
            </label>
          ))}
        </div>

        <h3>Section B: Conformity Assessment Requirements</h3>
        <p className="section-help">Select any statements that apply to your product under the identified law</p>
        <div className="options-group checkbox-group">
          {CONFORMITY_REQUIREMENTS.map((req) => (
            <label key={req} className="checkbox-option">
              <input
                type="checkbox"
                checked={conformityRequirements.includes(req)}
                onChange={() => toggleItem("conformityRequirements", req)}
              />
              <span>{req}</span>
            </label>
          ))}
        </div>

        <h3>Section C: Intended Function Characteristics</h3>
        <p className="section-help">Select any that describe your AI system</p>
        <div className="options-group checkbox-group">
          {INTENDED_FUNCTIONS.map((func) => (
            <label key={func} className="checkbox-option">
              <input
                type="checkbox"
                checked={intendedFunctions.includes(func)}
                onChange={() => toggleItem("intendedFunctions", func)}
              />
              <span>{func}</span>
            </label>
          ))}
        </div>

        {allSectionsComplete && answer === "yes" && (
          <div className="info-box alert-warning">
            <strong>⚠️ Notified Body Assessment Required:</strong>
            <p>Based on your responses, a conformity assessment with a notified body is required. Your system is classified as High-Risk (Annex I Section A).</p>
          </div>
        )}

        {allSectionsComplete && answer === "no" && (
          <div className="info-box alert-success">
            <strong>✓ No Ntified Body Assessment Required:</strong>
            <p>Based on your responses, only internal control is required.</p>
          </div>
        )}

        {allSectionsComplete && answer === "unsure" && (
          <div className="info-box alert-info">
            <strong>❓ Unable to Determine:</strong>
            <p>Please review your selection in Section A. You may need to consult EU law or regulatory guidance to make a definitive determination.</p>
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!allSectionsComplete || answer === "unsure"}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
