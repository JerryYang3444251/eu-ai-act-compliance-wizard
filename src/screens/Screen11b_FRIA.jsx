import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen11b_FRIA() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setIsFria, navigateBack, classification, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, roles } = useWizard();

  useEffect(() => {
    pushHistory("/screen10");
  }, [pushHistory]);
  
  const isPublicBody = answers.is_public_body;
  const deploymentSectors = answers.deploymentSectors || [];

  // Rule engine FRIA_001: Check if roles contain 'Public_Authority' OR deployment in sensitive sectors
  const isPublicAuthority = roles.includes("Provider") && isPublicBody === true; // Simplified mapping
  const hasSensitiveDeploymentSector = deploymentSectors.length > 0 && 
    deploymentSectors.some(s => ['law_enforcement', 'migration', 'asylum', 'border_control', 'justice'].includes(s));

  // Determine if FRIA should be required based on rule engine FRIA_001
  const isHighRisk = classification && [
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  // FRIA_001: (roles contains 'Public_Authority' OR deployment_sector intersects sensitive sectors) AND high-risk
  const friaRequired = (isPublicAuthority || hasSensitiveDeploymentSector) && isHighRisk;

  // Debug logging
  console.log("Screen11b_FRIA - Classification check:", {
    classification,
    isHighRisk,
    isPublicBody,
    friaRequired,
    HIGH_RISK_IB: CLASSIFICATIONS.HIGH_RISK_IB,
    HIGH_RISK_IA: CLASSIFICATIONS.HIGH_RISK_IA,
    HIGH_RISK_III: CLASSIFICATIONS.HIGH_RISK_III,
  });

  // Handle deployment sector toggle
  const handleSectorToggle = (sectorId) => {
    if (sectorId === "none") {
      if (deploymentSectors.includes("none")) {
        saveAnswer("deploymentSectors", []);
      } else {
        saveAnswer("deploymentSectors", ["none"]);
      }
    } else {
      if (deploymentSectors.includes("none")) {
        saveAnswer("deploymentSectors", [sectorId]);
      } else {
        const updated = deploymentSectors.includes(sectorId)
          ? deploymentSectors.filter(x => x !== sectorId)
          : [...deploymentSectors, sectorId];
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

    if (deploymentSectors.length === 0) {
      alert("Please select your deployment sector(s).");
      return;
    }

    // Set FRIA status based on rule engine FRIA_001 logic
    setIsFria(friaRequired);
    navigate("/screen12");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 11: Fundamental Rights Impact Assessment (FRIA)</h1>
        <p className="subtitle">Determine if FRIA is required for your AI system (Article 27)</p>
      </div>

      <div className="screen-content">

        {/* ===== PUBLIC BODY / AUTHORITY QUESTION ===== */}
        <div style={{ marginTop: "0", paddingTop: "0", borderTop: "none" }}>
          <h3 style={{ marginBottom: "16px" }}>Are you a public body or authority?</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.95em", color: "#666" }}>
            This affects whether Fundamental Rights Impact Assessment (FRIA) is required.
            Select "Yes" if you work for a government agency, public administration, or you are a private actor performing tasks “in the public interest” on behalf of a public authority (outsourced services).
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

        {/* ===== DEPLOYMENT SECTOR QUESTION ===== */}
        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: "16px" }}>Deployment Sectors</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.95em", color: "#666" }}>
            Select the sectors where your AI system will be deployed. Certain sensitive sectors trigger FRIA requirements even for non-public bodies.
          </p>
          
          <div className="options-group checkbox-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("law_enforcement")}
                onChange={() => handleSectorToggle("law_enforcement")}
              />
              <span>Law Enforcement</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("migration")}
                onChange={() => handleSectorToggle("migration")}
              />
              <span>Migration</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("asylum")}
                onChange={() => handleSectorToggle("asylum")}
              />
              <span>Asylum</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("border_control")}
                onChange={() => handleSectorToggle("border_control")}
              />
              <span>Border Control</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("justice")}
                onChange={() => handleSectorToggle("justice")}
              />
              <span>Administration of Justice</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("none")}
                onChange={() => handleSectorToggle("none")}
              />
              <span>None of the above sectors</span>
            </label>
          </div>
        </div>

        {/* FRIA REQUIREMENT RESULT - SHOW WHEN BOTH QUESTIONS ANSWERED */}
        {(isPublicBody !== null && deploymentSectors.length > 0) && (
          <div style={{ marginTop: "24px" }}>
            {friaRequired ? (
              <div className="info-box alert-warning">
                <strong>⚠️ FRIA Required:</strong>
                <p>
                  You must conduct and document a comprehensive Fundamental Rights Impact Assessment before deploying 
                  your system. This is required because you are {isPublicAuthority && "a public authority"}
                  {isPublicAuthority && hasSensitiveDeploymentSector && " and"}
                  {hasSensitiveDeploymentSector && " deploying in sensitive sectors"} with a high-risk AI system (Article 27a).
                </p>
              </div>
            ) : (
              <div className="info-box alert-info">
                <strong>ℹ️ No FRIA Required:</strong>
                <p>
                  FRIA is not required for your situation. {!isHighRisk ? "Your system is not high-risk." : "You are not a public authority and not deploying in sensitive sectors."}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={isPublicBody === null || isPublicBody === undefined || deploymentSectors.length === 0}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
