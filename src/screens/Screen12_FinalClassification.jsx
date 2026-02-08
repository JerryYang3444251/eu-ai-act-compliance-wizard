import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen12() {
  const navigate = useNavigate();
  const { classification, roles, resolvePrecedenceOrder, navigateBack, markStepsAsCompleted, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen12");
  }, [pushHistory]);

  // Use the global precedence resolver from context
  const finalClassification = resolvePrecedenceOrder(classification);

  // Log classification resolution for debugging
  if (classification !== finalClassification) {
    console.log(
      `Classification resolved: ${classification} → ${finalClassification} (precedence applied)`
    );
  }

  // =====================================================================
  // RULE ENGINE COMPLIANCE FIX #1:
  // Excluded, Prohibited, and Out-of-Scope classifications are terminal.
  // Redirect to SCREEN_FINAL immediately.
  // =====================================================================
  useEffect(() => {
    if (
      finalClassification === CLASSIFICATIONS.EXCLUDED ||
      finalClassification === CLASSIFICATIONS.PROHIBITED ||
      finalClassification === CLASSIFICATIONS.OUT_OF_SCOPE
    ) {
      // Mark Screen13 as completed since we're skipping it due to classification logic
      markStepsAsCompleted(["/screen13"]);
      navigate("/screenFinal");
    }
  }, [finalClassification, navigate, markStepsAsCompleted]);

  // =====================================================================
  // RULE ENGINE COMPLIANCE FIX #2:
  // Do NOT assign a default. If classification is missing, show an error.
  // =====================================================================
  if (!finalClassification) {
    return (
      <div className="screen-container">
        <div className="screen-header">
          <h1>Classification Missing</h1>
          <p className="subtitle">
            No classification was determined earlier in the flow.
            This may indicate an unexpected branching issue.
          </p>
        </div>
        <div className="screen-content">
          <div className="info-box alert-danger">
            <strong>Error:</strong>
            <p>
              The system was not classified. Please go back and complete 
              the previous steps.
            </p>
          </div>
          <div className="screen-navigation">
            <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normalized classification labels for display
  const classificationLabel = {
    [CLASSIFICATIONS.EXCLUDED]: "Excluded",
    [CLASSIFICATIONS.PROHIBITED]: "Prohibited",
    [CLASSIFICATIONS.OUT_OF_SCOPE]: "Out of Scope",
    [CLASSIFICATIONS.GPAI_SYSTEMIC]: "GPAI with Systemic Risk",
    [CLASSIFICATIONS.GPAI]: "General Purpose AI",
    [CLASSIFICATIONS.HIGH_RISK_IB]: "High-Risk (Annex I Section B)",
    [CLASSIFICATIONS.HIGH_RISK_IA]: "High-Risk (Annex I Section A)",
    [CLASSIFICATIONS.HIGH_RISK_III]: "High-Risk (Annex III)",
    [CLASSIFICATIONS.ANNEX_III_NON_SIGNIFICANT]:
      "Annex III Non-Significant Risk",
    [CLASSIFICATIONS.IN_SCOPE_NON_HIGH_RISK]: "In-Scope, Non-High-Risk",
  };

  const label = classificationLabel[finalClassification] || "Unknown Classification";

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    navigate("/screen13"); // Proceed to obligation calculation
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 12: Final Classification</h1>
        <p className="subtitle">Your AI system has been classified as:</p>
      </div>

      <div className="screen-content">
        <div className="classification-result">
          <div className="classification-badge">
            <h2>{label}</h2>
          </div>

          <div className="classification-details">
            <p>
              <strong>Role:</strong>{" "}
              {roles && roles.length > 0 ? roles.join(", ") : "Not selected"}
            </p>
            <p>
              <strong>Classification:</strong> {label}
            </p>
          </div>

          {/* High-risk systems info box */}
          {[
            CLASSIFICATIONS.HIGH_RISK_IB,
            CLASSIFICATIONS.HIGH_RISK_IA,
            CLASSIFICATIONS.HIGH_RISK_III,
          ].includes(finalClassification) && (
            <div className="info-box alert-warning">
              <strong>⚠️ High-Risk System:</strong>
              <p>
                High-risk AI systems face comprehensive obligations under 
                the EU AI Act. The next step will detail every requirement.
              </p>
            </div>
          )}

          {/* Annex III non-significant risk info box */}
          {finalClassification === CLASSIFICATIONS.ANNEX_III_NON_SIGNIFICANT && (
            <div className="info-box alert-info">
              <strong>ℹ️ Non-Significant Risk (Annex III):</strong>
              <p>
                This system is an Annex III use case but does not pose 
                significant risk. Notification obligations still apply.
              </p>
            </div>
          )}
        </div>

        <div className="screen-navigation">
          <button
            className="btn btn-secondary"
            onClick={() => navigateBack(navigate)}
          >
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            View Obligations →
          </button>
        </div>
      </div>
    </div>
  );
}
