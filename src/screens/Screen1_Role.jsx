import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";

export default function Screen1() {
  const navigate = useNavigate();
  const { roles_raw, setRoles_raw, navigateBack, reclassifyRoles, setRoles, saveAnswer, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen1");
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
        • import AND rebrand the AI system (Article 25), or
        • distribute AND rebrand the AI system (Article 26), or
        • manufacture a product where the AI is a safety component (Article 24).
      `},
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
        reclassified as a Provider automatically (Article 24).
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
          <div className="roles-summary" style={{ marginTop: "32px" }}>
            <h3 style={{ marginBottom: "16px", color: "#2c3e50" }}>
              ✓ Your Legal Role(s) under the EU AI Act:
            </h3>

            <div className="roles-grid" style={{ display: "grid", gap: "12px" }}>
              {computedRoles.map((role) => {
                const def = legalRoleDefinitions[role];
                return (
                  <div
                    key={role}
                    className="role-card"
                    style={{
                      border: "2px solid #27ae60",
                      borderRadius: "8px",
                      padding: "16px",
                      backgroundColor: "#f0fef4"
                    }}
                  >
                    <h4 style={{ color: "#27ae60", margin: "0 0 8px" }}>
                      {def?.title || role}
                    </h4>

                    <p style={{ margin: "0 0 8px", whiteSpace: "pre-line" }}>
                      {def?.description || "Legal role under EU AI Act"}
                    </p>
                  </div>
                );
              })}
            </div>
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
