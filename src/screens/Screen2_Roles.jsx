import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";

export default function Screen1() {
  const navigate = useNavigate();
  const { roles_raw, setRoles_raw, navigateBack, reclassifyRoles, setRoles, saveAnswer, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen2");
  }, [pushHistory]);

  // ----------------------------------------------------------------------
  // MODULE 2 — RAW ROLE INPUT CAPTURE
  // This list MUST match the rule engine trigger inputs EXACTLY.
  // ----------------------------------------------------------------------
  const orgActions = [
    { id: "develop", label: "Develop the AI system (original model, major new features)" },
    { id: "modify", label: "Substantially modify the AI system (architecture, data, design, performance)" },
    { id: "fine_tune", label: "Fine‑tune the model (adjust weights using new datasets)" },
    { id: "retrain", label: "Retrain the model (partial or full retraining)" },
    { id: "change_purpose", label: "Change the system’s intended purpose" },
    { id: "brand", label: "Brand or rename the AI system (place under our own name)" },
    { id: "place_on_market", label: "Place the AI system on the EU market" },
    { id: "import", label: "Import a third‑country AI system into the EU" },
    { id: "distribute", label: "Distribute/resell the AI system without modification" },
    { id: "deploy", label: "Deploy/use the AI system internally in operations" },
    { id: "product_manufacturer", label: "We manufacture a product that contains this AI system" }
  ];

  const handleToggleAction = (actionId) => {
    const updated = roles_raw.includes(actionId)
      ? roles_raw.filter((id) => id !== actionId)
      : [...roles_raw, actionId];

    setRoles_raw(updated);
    saveAnswer("roles_raw", updated);
  };

  // ----------------------------------------------------------------------
  // UPDATED: Full legal definitions with all MODULE 2B reclassification rules
  // ----------------------------------------------------------------------
  const legalRoleDefinitions = {
    Provider: {
      title: "Provider",
      description: `
        You are a Provider if you:
        • develop the AI system,
        • substantially modify it,
        • fine‑tune or retrain it,
        • change its intended purpose,
        • brand or rename it,
        • or place it on the EU market.

        You are also a Provider if you:
        • import AND rebrand the AI system, or
        • distribute AND rebrand the AI system, or
        • manufacture a product where the AI is a safety component.
      `,
      articles: "Articles 3(3), 16, 24, 25, 26"
    },
    Importer: {
      title: "Importer",
      description: `
        You are an Importer if you import an AI system from outside the EU
        without placing it under your own name or trademark.
      `,
      articles: "Article 25"
    },
    Distributor: {
      title: "Distributor",
      description: `
        You are a Distributor if you supply or resell the AI system to the market
        without modifying or rebranding it.
      `,
      articles: "Article 26"
    },
    Deployer: {
      title: "Deployer",
      description: `
        You are a Deployer if you use the AI system in your internal operations
        without modifying, retraining, re‑purposing, or rebranding it.
      `,
      articles: "Article 29"
    },
    Product_Manufacturer: {
      title: "Product Manufacturer",
      description: `
        You are a Product Manufacturer if you manufacture a product that contains the AI system.
        If the AI system fulfils a safety function under sectoral product law, you will be
        reclassified as a Provider automatically.
      `,
      articles: "Article 24"
    }
  };

  // Preview of MODULE 2B (dynamic live reclassification)
  const computedRoles = roles_raw.length > 0 ? reclassifyRoles(roles_raw || []) : [];

  // ----------------------------------------------------------------------
  // NEXT SCREEN HANDLER
  // ----------------------------------------------------------------------
  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (roles_raw.length === 0) {
      alert("Please select at least one activity. (Rule ROLE_008)");
      return;
    }

    // MODULE 2B — apply legal reclassification
    try {
      const computed = reclassifyRoles(roles_raw || []);
      setRoles(computed);
    } catch (err) {
      console.error("Role reclassification error:", err);
    }

    navigate("/screen3");
  };

  // ----------------------------------------------------------------------
  // UI
  // ----------------------------------------------------------------------
  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 2: What Does Your Organisation Do?</h1>
        <p className="subtitle">
          Select all applicable activities.  
          These will be transformed into legal EU AI Act roles automatically.
        </p>
      </div>

      <div className="screen-content">
        {/* Action Checkboxes */}
        <div className="options-group checkbox-group" style={{ marginTop: "20px" }}>
          {orgActions.map((action) => (
            <label key={action.id} className="checkbox-option">
              <input
                type="checkbox"
                checked={roles_raw.includes(action.id)}
                onChange={() => handleToggleAction(action.id)}
              />
              <span>{action.label}</span>
            </label>
          ))}
        </div>

        {/* REAL-TIME LEGAL ROLE OUTPUT */}
        {computedRoles.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            {(() => {
              // Detect reclassifications
              const hasProductManufacturer = roles_raw.includes("product_manufacturer");
              const hasImporter = roles_raw.includes("import");
              const hasDistributor = roles_raw.includes("distribute");
              const hasDeployer = roles_raw.includes("deploy");
              const hasBranding = roles_raw.includes("brand");
              const hasModification = roles_raw.some(a => ["develop", "modify", "fine_tune", "retrain", "change_purpose"].includes(a));
              
              const isProviderNow = computedRoles.includes("Provider");
              const wasReclassified = isProviderNow && (
                (hasImporter && hasBranding) ||
                (hasDistributor && hasBranding) ||
                (hasProductManufacturer && hasBranding) ||
                (hasDeployer && hasModification)
              );

              // Build role sentence
              const roleNames = computedRoles.map(r => legalRoleDefinitions[r]?.title || r);
              const roleSentence = roleNames.length === 1 
                ? roleNames[0]
                : roleNames.slice(0, -1).join(", ") + " and " + roleNames[roleNames.length - 1];

              return (
                <>
                  {wasReclassified ? (
                    <div className="info-box alert-warning">
                      <strong>Role Reclassification:</strong>
                      {hasImporter && hasBranding && "As an Importer placing the system under your own name, you have been reclassified to Provider. "}
                      {hasDistributor && hasBranding && "As a Distributor placing the system under your own name, you have been reclassified to Provider. "}
                      {hasProductManufacturer && hasBranding && "As a Product Manufacturer placing the AI system under your own name, you have been reclassified to Provider. "}
                      {hasDeployer && hasModification && "As a Deployer making substantial modifications, you have been reclassified to Provider. "}
                      Your legal role under the EU AI Act is now: <strong>{roleSentence}</strong>. You have full Provider obligations.
                      <span className="source-tag" title={hasImporter && hasBranding ? "Article 3(3), Article 25" : hasDistributor && hasBranding ? "Article 3(3), Article 26" : hasProductManufacturer && hasBranding ? "Article 3(3), Article 24" : "Article 3(3), Article 16(2)"}>Source</span>
                    </div>
                  ) : (
                    <div className="info-box alert-success">
                      <strong>Legal Role Determined:</strong>
                      Your legal role(s) under the EU AI Act: <strong>{roleSentence}</strong>.
                      {computedRoles.map((r, idx) => {
                        const arts = legalRoleDefinitions[r]?.articles;
                        return arts ? (
                          <span key={idx} className="source-tag" title={`Article ${arts}`}>
                            Source
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Navigation */}
        <div className="screen-navigation" style={{ marginTop: "32px" }}>
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={roles_raw.length === 0}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
