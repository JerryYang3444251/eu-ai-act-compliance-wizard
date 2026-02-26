import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen11b_FRIA() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setIsFria, navigateBack, classification, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, roles, isPublicServiceProvider, setIsPublicServiceProvider, setDeploymentSector, annexIIIPoint, setAnnexIIIPoint } = useWizard();

  useEffect(() => {
    pushHistory("/screen11");
  }, [pushHistory]);
  
  const isPublicBody = answers.is_public_body;
  const deploymentSectors = answers.deploymentSectors || [];
  const selectedUseCases = answers.annexIIIUsecases || [];

  // Auto-detect Annex III point from selected use cases
  const detectAnnexIIIPoint = (useCases) => {
    if (useCases.some(id => ['biometric_rbi', 'biometric_categorisation', 'emotion_recognition'].includes(id))) return 1;
    if (useCases.includes('critical_infrastructure')) return 2;
    if (useCases.some(id => id.startsWith('education_'))) return 3;
    if (useCases.some(id => id.startsWith('employment_'))) return 4;
    if (useCases.some(id => id.startsWith('services_'))) return 5;
    if (useCases.some(id => id.startsWith('law_'))) return 6;
    if (useCases.some(id => id.startsWith('migration_'))) return 7;
    if (useCases.some(id => id.startsWith('justice_'))) return 8;
    return null;
  };

  // Detect inconsistency between auto-populated and current deployment sectors
  const detectDeploymentInconsistency = () => {
    const hasAnnexIII = selectedUseCases.length > 0 && !selectedUseCases.includes('none');
    if (!hasAnnexIII) return null;
    
    // Calculate expected deployment sectors based on use cases
    const expectedSectors = [];
    if (selectedUseCases.some(id => ['biometric_rbi', 'biometric_categorisation', 'emotion_recognition'].includes(id))) {
      expectedSectors.push('biometrics');
    }
    if (selectedUseCases.some(id => id.startsWith('education_'))) {
      expectedSectors.push('education');
    }
    if (selectedUseCases.some(id => id.startsWith('employment_'))) {
      expectedSectors.push('employment');
    }
    if (selectedUseCases.some(id => id.startsWith('services_'))) {
      expectedSectors.push('essential_services');
    }
    if (selectedUseCases.some(id => id.startsWith('law_'))) {
      expectedSectors.push('law_enforcement');
    }
    if (selectedUseCases.some(id => id.startsWith('migration_'))) {
      expectedSectors.push('migration_asylum_border');
    }
    if (selectedUseCases.some(id => id.startsWith('justice_'))) {
      expectedSectors.push('justice');
    }
    
    if (!expectedSectors.length) return null;
    
    const currentSectors = deploymentSectors || [];
    
    // Check if current selection significantly differs from expected
    const hasMajorDeviation = expectedSectors.some(expected => !currentSectors.includes(expected)) ||
                             currentSectors.some(current => current !== 'none' && !expectedSectors.includes(current));
    
    if (!hasMajorDeviation) return null;
    
    const sectorLabels = {
      'biometrics': 'Biometrics',
      'education': 'Education', 
      'employment': 'Employment',
      'essential_services': 'Essential Services',
      'law_enforcement': 'Law Enforcement',
      'migration_asylum_border': 'Migration/Asylum/Border',
      'justice': 'Justice'
    };
    
    return {
      expected: expectedSectors.map(s => sectorLabels[s] || s).join(', '),
      current: currentSectors.includes('none') ? 'None' : currentSectors.map(s => sectorLabels[s] || s).join(', ')
    };
  };

  const deploymentInconsistency = detectDeploymentInconsistency();

  // Auto-set Annex III point if not already set
  useEffect(() => {
    const hasAnnexIII = selectedUseCases.length > 0 && !selectedUseCases.includes('none');
    if (hasAnnexIII && annexIIIPoint === null) {
      const detectedPoint = detectAnnexIIIPoint(selectedUseCases);
      if (detectedPoint !== null) {
        setAnnexIIIPoint(detectedPoint);
      }
    }
  }, [selectedUseCases, annexIIIPoint, setAnnexIIIPoint]);

  // Auto-populate deployment sectors from Annex III use case selections
  useEffect(() => {
    const hasAnnexIII = selectedUseCases.length > 0 && !selectedUseCases.includes('none');
    if (hasAnnexIII && deploymentSectors.length === 0) {
      const sectorsToSet = [];
      
      // Map Annex III use cases to deployment sectors
      if (selectedUseCases.some(id => ['biometric_rbi', 'biometric_categorisation', 'emotion_recognition'].includes(id))) {
        sectorsToSet.push('biometrics');
      }
      if (selectedUseCases.some(id => id.startsWith('education_'))) {
        sectorsToSet.push('education');
      }
      if (selectedUseCases.some(id => id.startsWith('employment_'))) {
        sectorsToSet.push('employment');
      }
      if (selectedUseCases.some(id => id.startsWith('services_'))) {
        sectorsToSet.push('essential_services');
      }
      if (selectedUseCases.some(id => id.startsWith('law_'))) {
        sectorsToSet.push('law_enforcement');
      }
      if (selectedUseCases.some(id => id.startsWith('migration_'))) {
        sectorsToSet.push('migration_asylum_border');
      }
      if (selectedUseCases.some(id => id.startsWith('justice_'))) {
        sectorsToSet.push('justice');
      }
      
      if (sectorsToSet.length > 0) {
        saveAnswer('deploymentSectors', sectorsToSet);
      } else if (!hasAnnexIII) {
        // If no Annex III selected, default to 'none'
        saveAnswer('deploymentSectors', ['none']);
      }
    }
  }, [selectedUseCases, deploymentSectors.length, saveAnswer]);

  // Sync deploymentSectors to context whenever it changes
  useEffect(() => {
    if (deploymentSectors.length > 0) {
      setDeploymentSector(deploymentSectors);
    }
  }, [deploymentSectors, setDeploymentSector]);

  // Rule engine FRIA_001: Check if roles contain 'Public_Authority' OR deployment in sensitive sectors
  const isPublicAuthority = roles.includes("Provider") && isPublicBody === true; // Simplified mapping
  const hasSensitiveDeploymentSector = deploymentSectors.length > 0 && 
    deploymentSectors.some(s => ['biometrics', 'education', 'employment', 'essential_services', 'law_enforcement', 'migration_asylum_border', 'justice'].includes(s));

  // Determine if FRIA should be required based on rule engine FRIA_001
  const isHighRisk = classification && [
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  // Detect if using Annex III Point 5(b) or 5(c) - these require FRIA for ALL deployers
  const isAnnexIII_5b = selectedUseCases.includes('services_creditworthiness');
  const isAnnexIII_5c = selectedUseCases.includes('services_insurance');
  const isAnnexIII_5b_or_5c = isAnnexIII_5b || isAnnexIII_5c;

  // FRIA_001: Article 27 requirements
  // Special case: Point 5(b)/5(c) ALWAYS requires FRIA (regardless of high-risk classification)
  // Normal case: High-risk systems require FRIA if public authority/service provider OR sensitive sectors
  // Exempt: Annex III Point 2 (Critical Infrastructure)
  const friaRequired = 
    annexIIIPoint !== 2 && // Point 2 = Critical Infrastructure = EXEMPT per Article 27(1)
    (
      // Special provision: Point 5(b)/5(c) systems always require FRIA
      isAnnexIII_5b_or_5c ||
      // Standard provision: High-risk systems in sensitive contexts require FRIA
      (isHighRisk && (isPublicAuthority || isPublicServiceProvider || hasSensitiveDeploymentSector))
    );

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

    if (isPublicServiceProvider === null || isPublicServiceProvider === undefined) {
      alert("Please indicate whether you are a public service provider.");
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
        <p className="subtitle">Determine if FRIA is required for your AI system. <span className="source-tag" title="Article 27">Source</span></p>
      </div>

      <div className="screen-content">

        {/* ===== PUBLIC BODY / AUTHORITY QUESTION ===== */}
        <div style={{ marginTop: "0", paddingTop: "0", borderTop: "none" }}>
          <h3>Are you a public body or authority?</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.9rem", color: "#666" }}>
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

        {/* ===== PUBLIC SERVICE PROVIDER QUESTION ===== */}
        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
          <h3>Are you a public service provider?</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.95em", color: "#666" }}>
            This applies to private entities that provide services in the public interest (e.g., healthcare, utilities, education) 
            on behalf of or under contract with public authorities. This is distinct from being a public body directly.
          </p>
          
          <div className="options-group radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="is_public_service_provider"
                value="yes"
                checked={isPublicServiceProvider === true}
                onChange={() => setIsPublicServiceProvider(true)}
              />
              <span>Yes, we provide public services</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="is_public_service_provider"
                value="no"
                checked={isPublicServiceProvider === false}
                onChange={() => setIsPublicServiceProvider(false)}
              />
              <span>No, we do not provide public services</span>
            </label>
          </div>
        </div>

        {/* ===== ANNEX III POINT 5(b)/5(c) DETECTION - PRIVATE SECTOR FRIA ===== */}
        {isAnnexIII_5b_or_5c && (
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
            <div className="info-box" style={{ background: "#fff9e6", borderLeft: "4px solid #ffcc00" }}>
              <strong>⚠️ Special FRIA Requirement Detected:</strong>
              <p style={{ margin: "8px 0 0 0" }}>
                Your AI system uses {isAnnexIII_5b && "creditworthiness evaluation or credit scoring"}
                {isAnnexIII_5b && isAnnexIII_5c && " and "}
                {isAnnexIII_5c && "life/health insurance risk assessment"} 
                ({isAnnexIII_5b && "Annex III Point 5(b)"}
                {isAnnexIII_5b && isAnnexIII_5c && " and "}
                {isAnnexIII_5c && "Annex III Point 5(c)"}).
                <br/><br/>
                <strong>ALL deployers</strong> (both public and private entities) of these specific systems must conduct a Fundamental Rights Impact Assessment, regardless of your answers below.
                {" "}<span className="source-tag" title="Article 27(1) - deployers of high-risk AI systems referred to in points 5(b) and (c) of Annex III">Source</span>
              </p>
            </div>
          </div>
        )}

        {/* Auto-selection banner for deployment sectors */}
        {selectedUseCases.length > 0 && !selectedUseCases.includes('none') && deploymentSectors.length > 0 && !deploymentSectors.includes('none') && (
          <div className="info-box alert-info" style={{ marginBottom: "24px" }}>
            <strong>ℹ️ Auto-Selection:</strong> Based on your Part 5 Annex III use cases, we've pre-selected the corresponding deployment sectors below. You can change these selections if they don't match your situation.
          </div>
        )}

        {/* Inconsistency warning */}
        {deploymentInconsistency && (
          <div className="info-box alert-warning" style={{ marginBottom: "24px" }}>
            <strong>⚠️ Potential Inconsistency:</strong> Your current deployment sectors (<strong>{deploymentInconsistency.current}</strong>) differ from your Part 5 Annex III use cases, which suggest <strong>{deploymentInconsistency.expected}</strong>. Please verify this is correct for your situation.
          </div>
        )}

        {/* ===== DEPLOYMENT SECTOR QUESTION ===== */}
        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: "16px" }}>Deployment Sectors</h3>
          <p style={{ marginBottom: "16px", fontSize: "0.95em", color: "#666" }}>
            Select the high-risk areas (Annex III) where your AI system will be deployed. For public bodies and public service providers, deployment in these areas triggers FRIA requirements (except Point 2).
          </p>
          
          <div className="options-group checkbox-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("biometrics")}
                onChange={() => handleSectorToggle("biometrics")}
              />
              <span>Biometrics<span className="source-tag" title="Annex III(1) - Biometric identification and categorisation">Source</span></span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("education")}
                onChange={() => handleSectorToggle("education")}
              />
              <span>Education and Vocational Training<span className="source-tag" title="Annex III(3) - Education and vocational training">Source</span></span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("employment")}
                onChange={() => handleSectorToggle("employment")}
              />
              <span>Employment, Workers Management and access to Self-Employment<span className="source-tag" title="Annex III(4) - Employment, workers management and access to self-employment">Source</span></span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("essential_services")}
                onChange={() => handleSectorToggle("essential_services")}
              />
              <span>Essential Private and Public Services<span className="source-tag" title="Annex III(5) - Access to and enjoyment of essential private services and essential public services and benefits">Source</span></span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("law_enforcement")}
                onChange={() => handleSectorToggle("law_enforcement")}
              />
              <span>Law Enforcement<span className="source-tag" title="Annex III(6) - Law enforcement">Source</span></span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("migration_asylum_border")}
                onChange={() => handleSectorToggle("migration_asylum_border")}
              />
              <span>Migration, Asylum and Border Control Management<span className="source-tag" title="Annex III(7) - Migration, asylum and border control management">Source</span></span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={deploymentSectors.includes("justice")}
                onChange={() => handleSectorToggle("justice")}
              />
              <span>Administration of Justice and Democratic Processes<span className="source-tag" title="Annex III(8) - Administration of justice and democratic processes">Source</span></span>
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

        {/* FRIA REQUIREMENT RESULT - ALWAYS SHOW AT BOTTOM */}
        <div style={{ marginTop: "24px" }}>
          {friaRequired ? (
            <div className="info-box alert-warning">
              <strong>🔍 FRIA Required:</strong>
              <p>
              {isAnnexIII_5b_or_5c && (
                <>Your AI system uses creditworthiness evaluation or life/health insurance risk assessment (Annex III Point 5b/5c). ALL deployers of these systems must conduct FRIA, regardless of public/private status.</>
              )}
              {!isAnnexIII_5b_or_5c && (
                <>
                  You indicated you are {isPublicAuthority && "a public authority"}
                  {isPublicServiceProvider && !isPublicAuthority && "a private entity providing public services"}
                  {(isPublicAuthority || isPublicServiceProvider) && hasSensitiveDeploymentSector && " and"}
                  {hasSensitiveDeploymentSector && !isPublicAuthority && !isPublicServiceProvider && "deploying in sensitive sectors"}
                  {hasSensitiveDeploymentSector && (isPublicAuthority || isPublicServiceProvider) && " also deploying in sensitive sectors"}
                  {" "}with a high-risk AI system.
                </>
              )}
              {" "}You must conduct and document a comprehensive Fundamental Rights Impact Assessment before deploying your system.
              {" "}<span className="source-tag" title="Article 27 - Fundamental Rights Impact Assessment for High-Risk AI Systems">Source</span>
              </p>
            </div>
          ) : (
            <div className="info-box alert-info">
              <strong>ℹ️ No FRIA Required:</strong>
              <p>
              Based on your selections, FRIA is not required. 
              {!isHighRisk && "Your system is not high-risk."}
              {isHighRisk && annexIIIPoint === 2 && "Critical infrastructure systems (Annex III Point 2) are exempt from FRIA."}
              {isHighRisk && annexIIIPoint !== 2 && !isPublicAuthority && !isPublicServiceProvider && !hasSensitiveDeploymentSector && !isAnnexIII_5b_or_5c && "You are not a public authority, public service provider, deploying in sensitive sectors, or using Point 5(b)/(c) systems."}
              {" "}<span className="source-tag" title="Article 27 - Fundamental Rights Impact Assessment for High-Risk AI Systems">Source</span>
              </p>
            </div>
          )}
        </div>

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNext} 
            disabled={
              isPublicBody === null || 
              isPublicBody === undefined || 
              isPublicServiceProvider === null || 
              isPublicServiceProvider === undefined || 
              deploymentSectors.length === 0
            }
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
