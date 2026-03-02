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
    ...([
      { id: "place_on_market", label: "Place the AI system on the EU market", article: "Article 3(3), Article 16" },
      { id: "import", label: "Import a third‑country AI system into the EU", article: "Article 3(6), Article 23" },
      { id: "distribute", label: "Distribute/resell the AI system", article: "Article 3(7), Article 24" },
      { id: "deploy", label: "Deploy/use the AI system", article: "Article 3(4), Article 26" },
      { id: "product_manufacturer", label: "Manufacture a product that integrates the AI system", article: "Article 25(3)" },
      { id: "act_as_ar", label: "Act as the authorised representative for a provider established outside the EU", article: "Article 22" }
    ]),
    ...([
      { id: "develop_system", label: "Develop an AI system (building or integrating components into a complete system)", article: "Article 3(3), Article 16" },
      { id: "develop_model", label: "Develop or train an AI model", article: "Article 3(63), Article 53" },
      { id: "modify", label: "Substantially modify the AI system (architecture, data, design, performance)", article: "Article 3(23), Article 28" },
      { id: "fine_tune", label: "Fine‑tune or retrain an AI model", article: "Article 3(23), Article 28(1)" },
      { id: "change_purpose", label: "Change the AI system's intended purpose", article: "Article 3(23), Article 28(1)(b)" },
      { id: "brand", label: "Brand or rename the AI system (place under our own name)", article: "Article 3(3), Article 25(1)(a)" }
    ])
  ];
  
  const baseActivities = orgActions.slice(0, 6);
  const modificationActivities = orgActions.slice(6);

  const handleToggleAction = (actionId) => {
    const updated = roles_raw.includes(actionId)
      ? roles_raw.filter((id) => id !== actionId)
      : [...roles_raw, actionId];

    setRoles_raw(updated);
    saveAnswer("roles_raw", updated);
  };

  // Legal role definitions with MODULE 2B reclassification rules
  const legalRoleDefinitions = {
    Provider: {
      title: "Provider",
      description: `
        Under the EU AI Act, you have Provider obligations if you:
        • develop an AI system or AI model and place it on the market,
        • substantially modify an AI system,
        • fine‑tune or retrain an AI model,
        • change an AI system's intended purpose,
        • place an AI system on the market under your own name or trademark.

        You are also reclassified as Provider if you:
        • import AND rebrand an AI system,
        • distribute AND rebrand an AI system, or
        • manufacture a product where the AI system is a safety component.
      `,
      articles: "Articles 3(3), 16, 24, 25, 26"
    },
    Importer: {
      title: "Importer",
      description: `
        You are an Importer if you import an AI system from outside the EU
        without placing it under your own name or trademark.
      `,
      articles: "Articles 3(6), 25"
    },
    Distributor: {
      title: "Distributor",
      description: `
        You are a Distributor if you supply or resell the AI system to the market
        without modifying or rebranding it.
      `,
      articles: "Articles 3(7), 26"
    },
    Deployer: {
      title: "Deployer",
      description: `
        You are a Deployer if you use the AI system in your internal operations
        without modifying, retraining, re‑purposing, or rebranding it.
      `,
      articles: "Articles 3(4), 29"
    },
    Product_Manufacturer: {
      title: "Product Manufacturer",
      description: `
        You are a Product Manufacturer if you manufacture a product that integrates an AI system.
        If the AI system fulfils a safety function under sectoral product law, you will be
        reclassified as a Provider automatically.
      `,
      articles: "Article 24"
    },
    Authorised_Representative: {
      title: "Authorised Representative",
      description: `
        You are an Authorised Representative if you are established in the EU and have been
        mandated in writing by a provider established outside the EU to act on their behalf
        for the purposes of the EU AI Act.
      `,
      articles: "Article 22"
    }
  };

  // Preview of MODULE 2B (dynamic live reclassification)
  const computedRoles = roles_raw.length > 0 ? reclassifyRoles(roles_raw || []) : [];

  // Next screen handler
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

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 2: What Does Your Organisation Do?</h1>
        <p className="subtitle">
          Select all applicable activities with AI systems or AI models.
          These will be transformed into legal EU AI Act roles automatically.
        </p>
      </div>

      <div className="screen-content">
        {/* SECTION 1: Base Organizational Activities */}
        <div style={{ marginBottom: "32px" }}>
          <h3>Base Organizational Activities</h3>
          <p style={{ marginBottom: "12px", color: "var(--text-light)" }}>
            Select your organization's primary activities with AI systems:
          </p>
          <div className="options-group checkbox-group">
            {baseActivities.map((action) => (
              <label key={action.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={roles_raw.includes(action.id)}
                  onChange={() => handleToggleAction(action.id)}
                />
                <span>
                  {action.label}
                  {action.article && (
                    <span className="source-tag" title={action.article} style={{ marginLeft: "6px" }}>Source</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SECTION 2: Modification & Development Activities */}
        <div style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "2px solid var(--border-color)" }}>
          <h3>Development & Modification Activities</h3>
          <p style={{ marginBottom: "12px", color: "var(--text-light)" }}>
            Select any development or modification work with AI systems or AI models (may result in role reclassification):
          </p>
          
          <div className="helper-box" style={{ marginBottom: "16px", fontSize: "0.9em", backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "4px", border: "1px solid #dee2e6" }}>
            <strong>📘 Key Distinction:</strong>
            <ul style={{ marginTop: "8px", marginBottom: "8px", marginLeft: "20px" }}>
              <li><strong>AI MODEL:</strong> A trained component (e.g., GPT-4, BERT, image recognition model) that requires additional components (interface, integration layer) to function as a complete system.</li>
              <li><strong>AI SYSTEM:</strong> A complete solution that integrates a model with user interface, logic, and other components to generate outputs (predictions, content, recommendations, decisions) for end users.</li>
            </ul>
            <span className="source-tag" title="Article 3(1), Recital 442">Source</span>
          </div>

          <div className="options-group checkbox-group">
            {modificationActivities.map((action) => {
              // Enhanced labels with examples
              let enhancedLabel = action.label;
              if (action.id === "develop_model") {
                enhancedLabel = "Develop or train an AI model (the underlying ML component, e.g., training a language model, image recognition model)";
              } else if (action.id === "develop_system") {
                enhancedLabel = "Develop an AI system by integrating components (building a complete application using existing AI models, e.g., a chatbot using GPT API)";
              } else if (action.id === "modify") {
                enhancedLabel = "Substantially modify an AI system's architecture, data, design, or performance (changes that affect its fundamental behavior)";
              } else if (action.id === "fine_tune") {
                enhancedLabel = "Fine-tune or retrain an AI model on your own data (adjusting an existing model's parameters, e.g., fine-tuning GPT on company documents)";
              } else if (action.id === "change_purpose") {
                enhancedLabel = "Change the AI system's intended purpose (repurposing a system for a different use case)";
              } else if (action.id === "brand") {
                enhancedLabel = "Brand or rename the AI system (place under our own name or trademark)";
              }
              
              return (
                <label key={action.id} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={roles_raw.includes(action.id)}
                    onChange={() => handleToggleAction(action.id)}
                  />
                  <span>
                    {enhancedLabel}
                    {action.article && (
                      <span className="source-tag" title={action.article} style={{ marginLeft: "6px" }}>Source</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Your Legal Roles (After Reclassification) */}
        {computedRoles.length > 0 && (
          <div style={{ marginTop: "32px", paddingTop: "32px", borderTop: "2px solid var(--border-color)" }}>
            <h3>Your Legal Roles Under the EU AI Act</h3>
            {(() => {
              // Detect reclassifications - ALL MODULE 2B scenarios
              const hasProductManufacturer = roles_raw.includes("product_manufacturer");
              const hasImporter = roles_raw.includes("import");
              const hasDistributor = roles_raw.includes("distribute");
              const hasDeployer = roles_raw.includes("deploy");
              const hasBranding = roles_raw.includes("brand");
              const hasModification = roles_raw.some(a => ["develop_system", "develop_model", "modify", "fine_tune", "change_purpose"].includes(a));
              const hasPlaceOnMarket = roles_raw.includes("place_on_market");
              
              const isProviderNow = computedRoles.includes("Provider");
              
              // Check if user selected any base activities (non-provider roles)
              const hasBaseActivityOnly = (hasImporter || hasDistributor || hasDeployer || hasProductManufacturer) 
                && !hasModification && !hasPlaceOnMarket && !hasBranding;
              
              // Check if user selected a base activity AND a modification activity
              const hasReclassificationTrigger = (hasImporter || hasDistributor || hasDeployer || hasProductManufacturer)
                && (hasModification || hasBranding);
              
              // Determine reclassification scenario
              let reclassificationReason = null;
              let reclassificationArticle = null;
              
              if (isProviderNow && hasReclassificationTrigger) {
                // RECLASS_005: Importer + Branding → Provider
                if (hasImporter && hasBranding && !hasModification && !hasPlaceOnMarket) {
                  reclassificationReason = "As an Importer placing the system under your own name, you have been reclassified to Provider.";
                  reclassificationArticle = "Article 3(3), Article 25(1)(a)";
                }
                // RECLASS_006: Distributor + Branding → Provider
                else if (hasDistributor && hasBranding && !hasImporter && !hasModification && !hasPlaceOnMarket) {
                  reclassificationReason = "As a Distributor placing the system under your own name, you have been reclassified to Provider.";
                  reclassificationArticle = "Article 3(3), Article 25(1)(a)";
                }
                // RECLASS_007: Deployer + modifications → Provider
                else if (hasDeployer && hasModification && !hasBranding && !hasPlaceOnMarket) {
                  reclassificationReason = "As a Deployer making substantial modifications, you have been reclassified to Provider.";
                  reclassificationArticle = "Article 3(3), Article 28(1)";
                }
                // Generic reclassification message for other combinations
                else if (hasImporter || hasDistributor || hasDeployer || hasProductManufacturer) {
                  const baseRole = hasImporter ? "Importer" : hasDistributor ? "Distributor" : hasDeployer ? "Deployer" : "Product Manufacturer";
                  reclassificationReason = `Your base role as ${baseRole} has been reclassified to Provider due to your modification activities.`;
                  reclassificationArticle = "Article 3(3)";
                }
              }
              
              const wasReclassified = reclassificationReason !== null;
              
              // Check if user does modification activities that require cooperation
              const hasModificationActivity = modificationActivities.some(activity => 
                roles_raw.includes(activity.id)
              );
              const needsCooperation = computedRoles.includes("Provider") && hasModificationActivity;

              // Build role sentence
              const roleNames = computedRoles.map(r => legalRoleDefinitions[r]?.title || r);
              const roleSentence = roleNames.length === 1 
                ? roleNames[0]
                : roleNames.slice(0, -1).join(", ") + " and " + roleNames[roleNames.length - 1];

              return (
                <>
                  {wasReclassified ? (
                    <div className="info-box alert-warning">
                      <strong>⚠️ Role Reclassification:</strong> {reclassificationReason} <span className="source-tag" title={reclassificationArticle}>Source</span>
                      <br />
                      Your legal role under the EU AI Act is now: <strong>{roleSentence}</strong>. You have full Provider obligations.
                      {needsCooperation && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Note:</strong> The original provider must cooperate with you by providing necessary technical documentation, information, and access to enable your compliance <span className="source-tag" title="Article 25(2)">Source</span>.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="info-box alert-success">
                      <strong>✓ Legal Role Determined:</strong>
                      Your legal role(s) under the EU AI Act: <strong>{roleSentence}</strong>. 
                      {computedRoles.map((r, idx) => {
                        const arts = legalRoleDefinitions[r]?.articles;
                        return arts ? (
                          <span key={idx} className="source-tag" title={arts}>
                            Source
                          </span>
                        ) : null;
                      })}
                      {needsCooperation && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Note:</strong> The original provider must cooperate with you by providing necessary technical documentation, information, and access to enable your compliance <span className="source-tag" title="Article 25(2)">Source</span>.
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Navigation */}
        <div className="screen-navigation" style={{ marginTop: "40px" }}>
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
