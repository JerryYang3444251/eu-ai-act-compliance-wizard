import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { ANNEX_III_USECASES, CLASSIFICATIONS } from "../data/checklist";

export default function Screen7_AnnexIII() {
  const navigate = useNavigate();
  const { answers, toggleAnswer, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, roles_raw } = useWizard();

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
        <h1>Part 5: Annex III Use Cases</h1>
        <p className="subtitle">Does your AI system fall within any of these high-risk use cases?</p>
      </div>

      <div className="screen-content">
        {/* Phase 3: Context banner for pure model developers */}
        {roles_raw && roles_raw.includes("develop_model") && !roles_raw.some(id => ["develop_system", "modify", "change_purpose", "place_on_market", "brand"].includes(id)) && (
          <div className="info-box alert-info" style={{ marginBottom: "24px" }}>
            <strong>ℹ️ Note for AI Model Developers:</strong> These questions address the intended use of the AI system in which your model may be integrated. If you have no knowledge of the downstream deployment context, select "None of the above" — your obligations as a model developer will be assessed from Part 7 onwards.
          </div>
        )}
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
            if (option.id === "none") {
              acc.push(<hr key="none-sep" style={{ margin: "8px 0", borderColor: "var(--border-color)" }} />);
            }
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
            {_willReclass && (
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.15)" }}>
                <strong>Role Reclassification:</strong>{" "}
                <>If Part 6 confirms high-risk status, you will be reclassified as <strong>Provider</strong>.</>
                {" "}<span className="source-tag" title={_reclassArt}>Source</span>
              </div>
            )}
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
