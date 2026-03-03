import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { HIGH_RISK_SECTORS_B, CLASSIFICATIONS } from "../data/checklist";

export default function Screen4() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, roles_raw } = useWizard();

  useEffect(() => {
    pushHistory("/screen4");
  }, [pushHistory]);
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
      // Rule A1B_001: High-risk detected → skip to SCREEN_7 (GPAI)
      navigate("/screen7");
    } else {
      // Rule A1B_002: No high-risk → continue to SCREEN_5 (Annex III)
      navigate("/screen5");
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
        <h1>Part 4: Annex I Section B High-Risk Check</h1>
        <p className="subtitle">Does your AI system relate to any of the following regulated product sectors?</p>
      </div>

      <div className="screen-content">
        {/* Phase 3: Context banner for pure model developers */}
        {roles_raw && roles_raw.includes("develop_model") && !roles_raw.some(id => ["develop_system", "modify", "change_purpose", "place_on_market", "brand"].includes(id)) && (
          <div className="info-box alert-info" style={{ marginBottom: "24px" }}>
            <strong>ℹ️ Note for AI Model Developers:</strong> These questions address the intended use of the AI system in which your model may be integrated. If you have no knowledge of the downstream deployment context, select "None of the above" — your obligations as a model developer will be assessed from Part 7 onwards.
          </div>
        )}
        <div className="options-group checkbox-group">
          {HIGH_RISK_SECTORS_B.flatMap((option) => {
            const el = (
              <label key={option.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={sectors.includes(option.id)}
                  onChange={() => handleToggle(option.id)}
                />
                <span>{option.label}</span>
              </label>
            );
            if (option.id === "none") return [
              <hr key="none-sep" style={{ margin: "8px 0", borderColor: "var(--border-color)" }} />,
              el
            ];
            return el;
          })}
        </div>

        {sectors.length > 0 && !sectors.includes("none") && (
          <div className="info-box alert-warning">
            <strong>⚠️ High-Risk Classification:</strong> You selected one or more regulated sectors. Your AI system is classified as High-Risk under Annex I Section B. <span className="source-tag" title="Article 6(1) and Annex I, Section B">Source</span>
            {_willReclass && (
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.15)" }}>
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
          <button className="btn btn-primary" onClick={handleNext} disabled={sectors.length === 0}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
