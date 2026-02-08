import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { ANNEX_IA_CATEGORIES, CLASSIFICATIONS } from "../data/checklist";

export default function Screen5() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, roles_raw, roles } = useWizard();

  useEffect(() => {
    pushHistory("/screen3");
  }, [pushHistory]);

  const categories = answers.annexIACategories || [];
  const safety_function = answers.safety_function; // "yes" / "no" / null

  // Check if Product_Manufacturer was reclassified to Provider due to safety function
  const isProductManufacturer = roles_raw.includes("product_manufacturer");
  const wasReclassifiedToProvider = isProductManufacturer && 
    safety_function === "yes" && 
    roles.includes("Provider") && 
    !roles.includes("Product_Manufacturer");

  const handleToggle = (id) => {
    if (id === "none") {
      // Selecting "none" clears others
      if (categories.includes("none")) {
        saveAnswer("annexIACategories", []);
      } else {
        saveAnswer("annexIACategories", ["none"]);
      }
    } else {
      // Selecting anything else clears "none"
      if (categories.includes("none")) {
        saveAnswer("annexIACategories", [id]);
      } else {
        const updated = categories.includes(id)
          ? categories.filter((c) => c !== id)
          : [...categories, id];
        saveAnswer("annexIACategories", updated);
      }
    }
  };

  const hasSelection = categories.length > 0;
  const hasCategory = hasSelection && !categories.includes("none");

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    // Must answer category selection AND safety function
    if (!hasSelection || safety_function === null) {
      alert("Please answer all questions before proceeding.");
      return;
    }

    //
    // ------------------------------
    // EU AI Act Annex I A Logic
    // ------------------------------
    //
    // A1A_001: If product_laws not empty → evaluate safety function
    // A1A_002: If category selected AND safety_function == yes → HIGH_RISK_IA → Skip to Screen7 (GPAI)
    // A1A_003: If category selected AND safety_function == no → go to Screen4 (Annex I B)
    // If no category selected → skip Annex I A → go to Screen4 (Annex I B)
    //

    if (hasCategory && safety_function === "yes") {
      // HIGH RISK ANNEX I A
      setClassificationWithPrecedence(CLASSIFICATIONS.HIGH_RISK_IA);
      navigate("/screen7"); // Skip to GPAI check (Annex IB not needed when already high-risk)
      return;
    }

    // Category selected BUT not a safety function
    // OR no category selected at all
    // → go to Annex I B (Screen4)
    navigate("/screen4");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 3: Annex I Section A — Product Safety Framework</h1>
        <p className="subtitle">
          Answer the questions below to determine your system's risk classification and whether your role should be reclassified.
        </p>
      </div>

      <div className="screen-content">

        {/* Product category selection */}
        <div className="form-section">
          <h3>Regulated Product Category (Annex I A)</h3>
          <p className="subtle">
            Is your AI system part of any regulated EU product category?
          </p>

          <div className="options-group checkbox-group">
            {ANNEX_IA_CATEGORIES.map((option) => (
              <label key={option.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={categories.includes(option.id)}
                  onChange={() => handleToggle(option.id)}
                />
                <span>{option.label}{option.source && <span className="source-tag" title={option.source}>Source</span>}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Safety function question */}
        <div className="form-section" style={{ marginTop: "32px" }}>
          <h3>Does the AI perform a safety function?</h3>
          <p className="subtle">
            A safety function is one whose failure could endanger health, safety,
            or property under the relevant product legislation.
          </p>

          <div className="options-group radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="safety_function"
                value="yes"
                checked={safety_function === "yes"}
                onChange={() => saveAnswer("safety_function", "yes")}
              />
              <span>Yes — the AI performs a safety function</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="safety_function"
                value="no"
                checked={safety_function === "no"}
                onChange={() => saveAnswer("safety_function", "no")}
              />
              <span>No — it does not perform a safety function</span>
            </label>
          </div>
        </div>

        {/* Warning box — only when BOTH conditions match Annex I A */}
        {hasCategory && safety_function === "yes" && (
          <div className="info-box alert-warning" style={{ marginTop: "24px" }}>
            <strong>High-Risk Classification:</strong> Your AI system is classified as <strong>High-Risk</strong> because it performs a safety function in a regulated product category. <span className="source-tag" title="Article 6(1) and Annex I, Section A">Source</span>
            {wasReclassifiedToProvider && (
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                <strong>Role Reclassification:</strong> Because the AI performs a safety function, your role has been reclassified from Product Manufacturer to <strong>Provider</strong>. You now have full Provider obligations. <span className="source-tag" title="Article 3(3) and 24">Source</span>
              </div>
            )}
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!hasSelection || safety_function === null}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
