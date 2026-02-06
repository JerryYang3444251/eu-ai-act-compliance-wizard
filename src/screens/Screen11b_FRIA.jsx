import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS, DEPLOYMENT_SECTORS } from "../data/checklist";

export default function Screen11b_FRIA() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setIsFria, navigateBack, classification, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen11b");
  }, [pushHistory]);
  const isPublicBody = answers.is_public_body;
  const deploymentSectors = answers.deploymentSectors || [];

  // Determine if FRIA should be required based on Rule FRIA_001:
  // (is_public_body OR sensitive_deployment_sector) AND high-risk classification
  const isHighRisk = classification && [
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  const hasSensitiveDeploymentSector = deploymentSectors.some(s => 
    ['law_enforcement', 'migration', 'border_control', 'justice'].includes(s)
  );

  const friaRequired = (isPublicBody === true || hasSensitiveDeploymentSector) && isHighRisk;

  // Debug logging
  console.log("Screen11b_FRIA - FRIA determination:", {
    classification,
    isHighRisk,
    isPublicBody,
    deploymentSectors,
    hasSensitiveDeploymentSector,
    friaRequired,
  });

  // Handle deployment sector toggle
  const handleToggleDeploymentSector = (id) => {
    if (id === "none") {
      if (deploymentSectors.includes("none")) {
        saveAnswer("deploymentSectors", []);
      } else {
        saveAnswer("deploymentSectors", ["none"]);
      }
    } else {
      if (deploymentSectors.includes("none")) {
        saveAnswer("deploymentSectors", [id]);
      } else {
        const updated = deploymentSectors.includes(id)
          ? deploymentSectors.filter(x => x !== id)
          : [...deploymentSectors, id];
        saveAnswer("deploymentSectors", updated);
      }
    }
  };

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (isPublicBody === null || isPublicBody === undefined) {
      alert("Please indicate whether you are a public body/authority.");
      return;
    }

    // Set FRIA status based on Rule FRIA_001: (is_public_body OR sensitive_sector) AND high-risk
    setIsFria(friaRequired);
    navigate("/screen12");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 11: Fundamental Rights Impact Assessment (FRIA)</h1>
        <p className="subtitle">Determine if FRIA is required for your AI system (Article 27a)</p>
      </div>

      <div className="screen-content">

        {/* ===== PUBLIC BODY / AUTHORITY QUESTION ===== */}
        <div style={{ marginTop: "0", paddingTop: "0", borderTop: "none" }}>
          <h3 style={{ marginBottom: "16px" }}>Are you a public body or authority?</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.95em", color: "#666" }}>
            This affects whether Fundamental Rights Impact Assessment (FRIA) is required.
            Select "Yes" if you work for a government agency, public administration, or you are a private actor performing tasks "in the public interest" on behalf of a public authority (outsourced services).
          </p>
          
          <div className="options-group radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="is_public_body"
                value="yes"
                checked={answers.is_public_body === true}
                onChange={() => saveAnswer("is_public_body", true)}
              />
              <span>Yes, we are, or serve for, a public body/authority</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="is_public_body"
                value="no"
                checked={answers.is_public_body === false}
                onChange={() => saveAnswer("is_public_body", false)}
              />
              <span>No, we fall outside of the above scope</span>
            </label>
          </div>
        </div>

        {/* ===== DEPLOYMENT SECTOR QUESTION (even for non-public bodies) ===== */}
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ marginBottom: "16px" }}>What is the deployment sector? (Article 27a)</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.95em", color: "#666" }}>
            FRIA may also be required for private deployers in sensitive sectors. Select all that apply:
          </p>
          
          <div className="options-group checkbox-group">
            {DEPLOYMENT_SECTORS.map((option) => (
              <label key={option.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={deploymentSectors.includes(option.id)}
                  onChange={() => handleToggleDeploymentSector(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* FRIA REQUIREMENT RESULT */}
        <div style={{ marginTop: "24px" }}>
          {friaRequired ? (
            <div className="info-box alert-warning">
              <strong>⚠️ FRIA Required:</strong>
              <p>
                You must conduct and document a comprehensive Fundamental Rights Impact Assessment before deploying 
                your system (Article 27a). FRIA is required because:
                {isPublicBody === true && " you are a public body or authority, and"}
                {hasSensitiveDeploymentSector && " your system is deployed in a sensitive sector (law enforcement, migration, border control, or justice), and"}
                {" your system is classified as high-risk."}
              </p>
            </div>
          ) : (
            <div className="info-box alert-info">
              <strong>ℹ️ FRIA Not Required:</strong>
              <p>
                Based on your responses, FRIA is not required. You are {isPublicBody ? "a public body" : "not a public body"} 
                {hasSensitiveDeploymentSector ? " in a sensitive sector" : ""}, and your system is {isHighRisk ? "high-risk" : "not high-risk"}.
              </p>
            </div>
          )}
        </div>

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={isPublicBody === null || isPublicBody === undefined}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
