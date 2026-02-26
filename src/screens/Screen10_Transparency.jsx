import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { TRANSPARENCY_TRIGGERS, CLASSIFICATIONS } from "../data/checklist";

export default function Screen11_Transparency() {
  const navigate = useNavigate();
  const { answers, saveAnswer, classification, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, systemFunctionality, setSystemFunctionality, contentCharacteristics, setContentCharacteristics } = useWizard();

  useEffect(() => {
    pushHistory("/screen10");
  }, [pushHistory]);
  const selectedItems = answers.transparencyTriggers || [];
  const is_public_body = answers.is_public_body; // Rule OBL_009 gating: is_public_body + high-risk → FRIA

  // None-exclusive toggle: if "none" selected, deselect all others; if any other selected, deselect "none"
  const handleToggle = (id) => {
    if (id === "none") {
      if (selectedItems.includes("none")) {
        saveAnswer("transparencyTriggers", []);
      } else {
        saveAnswer("transparencyTriggers", ["none"]);
      }
    } else {
      if (selectedItems.includes("none")) {
        saveAnswer("transparencyTriggers", [id]);
      } else {
        const updated = selectedItems.includes(id)
          ? selectedItems.filter(x => x !== id)
          : [...selectedItems, id];
        saveAnswer("transparencyTriggers", updated);
      }
    }
  };

  const handleSystemFunctionalityToggle = (value) => {
    const current = systemFunctionality || [];
    
    // None-exclusive logic: if "none" selected, deselect all others; if any other selected, deselect "none"
    if (value === "none") {
      if (current.includes("none")) {
        setSystemFunctionality([]);
      } else {
        setSystemFunctionality(["none"]);
      }
    } else {
      if (current.includes("none")) {
        setSystemFunctionality([value]);
      } else {
        if (current.includes(value)) {
          setSystemFunctionality(current.filter(v => v !== value));
        } else {
          setSystemFunctionality([...current, value]);
        }
      }
    }
  };

  const hasTransparencyObligation = selectedItems.some(s => s !== "none");

  // Show "What does your system generate?" only if generates content
  const generatesContent = selectedItems.includes("synthetic_content") || 
                          selectedItems.includes("deepfakes");

  // Show "resembles real persons" only if generates content and answered Q1
  const shouldShowDeepfakeQuestion = systemFunctionality && 
                                     systemFunctionality.length > 0 && 
                                     !systemFunctionality.includes("none");

  // =====================================================================
  // PUBLIC BODY / AUTHORITY DETERMINATION
  // =====================================================================

  // Determine if FRIA assessment should be offered
  // Rule OBL_009: FRIA only applies if is_public_body === true AND classification is high-risk
  const isHighRisk = classification && [
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  const shouldOfferFRIA = is_public_body === true && isHighRisk;

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    // Validate that user answered transparency questions
    if (!selectedItems.length) {
      alert("Please select transparency obligations.");
      return;
    }

    // =====================================================================
    // TRANS_001 ROUTING LOGIC (Rule Engine Module 8)
    // =====================================================================
    // The rule engine specifies conditional routing based on Public_Authority status:
    // - IF Public_Authority AND High-Risk → route to FRIA screen
    // - ELSE → skip FRIA logic
    //
    // IMPLEMENTATION: We always route to Screen11 (FRIA screen) because:
    // 1. Public authority status is determined IN Screen11 (is_public_body question)
    // 2. Screen11 evaluates FRIA_001 rule and conditionally requires FRIA
    // 3. If FRIA not required, Screen11 proceeds directly to classification
    //
    // This approach satisfies TRANS_001's intent while collecting necessary data.
    // =====================================================================
    navigate("/screen11");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 10: Transparency Obligations</h1>
        <p className="subtitle">Select all that apply to your AI system:</p>
      </div>

      <div className="screen-content">
        <div className="options-group checkbox-group">
          {TRANSPARENCY_TRIGGERS.map((option) => (
            <label key={option.id} className="checkbox-option">
              <input
                type="checkbox"
                checked={selectedItems.includes(option.id)}
                onChange={() => handleToggle(option.id)}
              />
              <span>
                {option.label}{option.source && (
                  <span className="source-tag" title={option.source}>
                    Source
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>

        {/* SYSTEM FUNCTIONALITY SECTION - Only show if generates content */}
        {generatesContent && (
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
            <h3 style={{ marginBottom: "16px" }}>What does your system generate?</h3>
            <p style={{ marginBottom: "16px", fontSize: "0.9rem", color: "#666" }}>
              Select all types of content your AI system produces. This helps determine specific transparency requirements.
            </p>
            
            <div className="options-group checkbox-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={systemFunctionality?.includes("text")}
                  onChange={() => handleSystemFunctionalityToggle("text")}
                />
                <span>Text content</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={systemFunctionality?.includes("images")}
                  onChange={() => handleSystemFunctionalityToggle("images")}
                />
                <span>Images or graphics</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={systemFunctionality?.includes("audio")}
                  onChange={() => handleSystemFunctionalityToggle("audio")}
                />
                <span>Audio or voice content</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={systemFunctionality?.includes("video")}
                  onChange={() => handleSystemFunctionalityToggle("video")}
                />
                <span>Video content</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={systemFunctionality?.includes("code")}
                  onChange={() => handleSystemFunctionalityToggle("code")}
                />
                <span>Code or software</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={systemFunctionality?.includes("none")}
                  onChange={() => handleSystemFunctionalityToggle("none")}
                />
                <span>None of the above (analysis/classification only)</span>
              </label>
            </div>
          </div>
        )}

        {/* CONTENT CHARACTERISTICS SECTION - Only show if generates content AND answered Q1 */}
        {generatesContent && shouldShowDeepfakeQuestion && (
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
            <h3 style={{ marginBottom: "16px" }}>Does generated content resemble real persons, objects, places or events?</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.9rem", color: "#666" }}>
            This identifies deepfake-like capabilities requiring enhanced transparency obligations. <span className="source-tag" title="Article 50">Source</span>
          </p>
          
          <div className="options-group radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="content_characteristics"
                value="yes"
                checked={contentCharacteristics?.includes("realistic")}
                onChange={() => setContentCharacteristics(["realistic"])}
              />
              <span>Yes, resembles or simulates real entities/events</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="content_characteristics"
                value="no"
                checked={contentCharacteristics?.includes("none")}
                onChange={() => setContentCharacteristics(["none"])}
              />
              <span>No, content is clearly artificial or abstract</span>
            </label>
          </div>
        </div>
        )}

        {/* TRANSPARENCY OBLIGATION RESULT */}
        {selectedItems.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            {hasTransparencyObligation ? (
              <div className="info-box alert-warning">
                <strong>Transparency Obligations Identified:</strong>
                <p>
                  You selected one or more transparency-triggering functionalities. Your AI system has transparency disclosure obligations. Transparency checklist items will apply.
                  {contentCharacteristics?.includes("realistic") && 
                    (systemFunctionality?.includes("images") || systemFunctionality?.includes("video") || systemFunctionality?.includes("audio")) ? 
                    " Enhanced disclosure requirements apply for realistic synthetic content (deepfake labeling required)." : ""}
                  {systemFunctionality && systemFunctionality.length > 0 && !systemFunctionality.includes("none") ? 
                    " Content generation labeling requirements apply." : ""}
                  {" "}<span className="source-tag" title="Article 50">Source</span>
                </p>
              </div>
            ) : (
              <div className="info-box alert-success">
                <strong>✓ No Transparency Obligations:</strong>
                You selected "None of the above." Your system does not trigger specific transparency obligations. <span className="source-tag" title="Article 50">Source</span>
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
