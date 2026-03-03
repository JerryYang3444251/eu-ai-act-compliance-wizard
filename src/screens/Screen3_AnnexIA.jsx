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

  // Pending reclassification detection — Art. 25(1)/28(1) fires only for high-risk systems
  const _hasBrand   = roles_raw && roles_raw.includes("brand");
  const _hasDeploy  = roles_raw && roles_raw.includes("deploy");
  const _hasImport  = roles_raw && roles_raw.includes("import");
  const _hasDistrib = roles_raw && roles_raw.includes("distribute");
  const _hasDevAct  = roles_raw && roles_raw.some(a => ["develop_system", "develop_model"].includes(a));
  const _hasModAct  = roles_raw && roles_raw.some(a => ["modify", "change_purpose"].includes(a));
  const _isChgPurp  = roles_raw && roles_raw.includes("change_purpose") && !roles_raw.includes("modify");
  const _pendBrand  = _hasBrand && !_hasDevAct;
  const _pendMod    = _hasModAct && !_hasDevAct && !(roles_raw.includes("modify") && !roles_raw.includes("change_purpose") && answers.isSubstantialModification === "no");
  const _willReclass = _pendBrand || _pendMod;
  const _reclassFrom = _hasImport ? "Importer" : _hasDistrib ? "Distributor" : _hasDeploy ? "Deployer" : null;
  const _reclassArt  = _pendBrand ? "Article 25(1)(a)" : _isChgPurp ? "Article 25(1)(c)" : "Article 25(1)(b)";

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 3: Annex I Section A — Product Safety Framework</h1>
        <p className="subtitle">
          Answer the questions below to determine your system's risk classification and whether your role should be reclassified.
        </p>
      </div>

      <div className="screen-content">

        {/* Phase 3: Context banner for pure model developers */}
        {roles_raw.includes("develop_model") && !roles_raw.some(id => ["develop_system", "modify", "change_purpose", "place_on_market", "brand"].includes(id)) && (
          <div className="info-box alert-info" style={{ marginBottom: "24px" }}>
            <strong>ℹ️ Note for AI Model Developers:</strong> These questions address the intended use of the AI system in which your model may be integrated. If you have no knowledge of the downstream deployment context, select "None of the above" — your obligations as a model developer will be assessed from Part 7 onwards.
          </div>
        )}

        {/* Product category selection */}
        <div className="form-section">
          <h3>Regulated Product Category (Annex I A)</h3>
          <p className="subtle">
            Is your AI system part of any regulated EU product category?
          </p>

          <div className="options-group checkbox-group">
            {ANNEX_IA_CATEGORIES.flatMap((option) => {
              const el = (
                <label key={option.id} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={categories.includes(option.id)}
                    onChange={() => handleToggle(option.id)}
                  />
                  <span>{option.label}{option.source && <span className="source-tag" title={option.source}>Source</span>}</span>
                </label>
              );
              if (option.id === "none") return [
                <hr key="none-sep" style={{ margin: "8px 0", borderColor: "var(--border-color)" }} />,
                el
              ];
              return el;
            })}
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
            <strong>⚠️ High-Risk Classification:</strong> Your AI system is classified as <strong>High-Risk</strong> because it performs a safety function in a regulated product category. <span className="source-tag" title="Article 6(1) and Annex I, Section A">Source</span>
            {wasReclassifiedToProvider && (
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                <strong>Role Reclassification:</strong> Because the AI performs a safety function, your role has been reclassified from Product Manufacturer to <strong>Provider</strong>. You now have full Provider obligations. <span className="source-tag" title="Article 25(3)">Source</span>
              </div>
            )}
            {_willReclass && !wasReclassifiedToProvider && (
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                <strong>Role Reclassification:</strong>{" "}
                <>Because this system is high-risk, you are reclassified as <strong>Provider</strong>. Full Provider obligations apply.</>
                {" "}<span className="source-tag" title={_reclassArt}>Source</span>
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
